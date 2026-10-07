import Request from "@src/type/Request";
import Method from "@src/enum/Method";
import Response from "@src/Response";
import RequesterResponse from "@src/Response";
import InterceptEvent from "@src/enum/InterceptEvent";
import RequestBodyType, {RequestBodyTypeHeaders} from "@src/enum/RequestBodyType";
import Config from "@src/type/Config";
import InstanceConfig from "@src/type/InstanceConfig";
import PostRequestConfig from "@src/type/PostRequestConfig";
import GetRequestConfig from "@src/type/GetRequestConfig";
import {
    PostResponseCallback,
    PreRequestCallback,
    PreResponseCallback,
    ErrorCallback
} from "@src/type/InterceptEventCallbacks";
import {
    convertFormDataToObject,
    convertObjectToFormData,
    convertObjectToURLSearchParams,
    convertURLSearchParamsToObject
} from "@src/helper/DataHelper";


class Requester {

    private config: Config;
    private namespace?: string;

    private static interceptors: {[key: number]: [
        InterceptEvent,
        (PreRequestCallback | PostResponseCallback | PreResponseCallback | ErrorCallback),
        (string | undefined)
    ]} = {};
    private static nextId = 0;

    static defaults: Config = {
        timeout: 3000
    };

    static namespace: { [key: string]: Config } = {};

    static instance(args?: InstanceConfig): Requester {
        return new Requester(args?.config, args?.namespace);
    }

    constructor(config?: Config, namespace?: string) {
        this.config = {
            ...Requester.defaults,
            ...(config ?? {}),
            ...(namespace && Requester.namespace[namespace] ? Requester.namespace[namespace] : {})
        };

        this.namespace = namespace;
    }

    static on(event: InterceptEvent, callable: PreRequestCallback | PreResponseCallback | PostResponseCallback | ErrorCallback, namespace?: string): number {
        const id = ++this.nextId;
        this.interceptors[id] = [event, callable, namespace];
        return id;
    };

    static off(interceptorId: number) {
        if (this.interceptors[interceptorId] !== undefined) {
            delete this.interceptors[interceptorId];
        }

        return this;
    }

    async fetch({
              url,
              method = Method.GET,
              body,
              bodyType,
              query,
              signal,
              auth,
              headers,
              timeout
          }: Request): Promise<Response> {
        url = new URL(url, this.config?.baseURL || undefined);
        auth ??= this.config?.authorization;

        const requestId = ++Requester.nextId;
        const search = new URLSearchParams((url as URL).searchParams);
        const appendToSearch = (parameters: URLSearchParams) => {
            parameters.forEach((value, key) => {
                search.append(key, String(value));
            });
        };

        appendToSearch(convertObjectToURLSearchParams(auth?.getQuery() || {}));

        if (query instanceof URLSearchParams || query instanceof FormData) {
            query.forEach((value, key) => {
                search.append(key, String(value));
            });
        } else if (query) {
            appendToSearch(convertObjectToURLSearchParams(query));
        }

        url.search = search.toString();
        const abortController = new AbortController();
        const abortFromCaller = () => abortController.abort(signal?.reason);
        if (signal?.aborted) {
            abortFromCaller();
        } else {
            signal?.addEventListener('abort', abortFromCaller, {once: true});
        }

        const timeoutInterval = setTimeout(() => abortController.abort(), timeout ?? this.config?.timeout ?? 30000);
        const options: any = {
            signal: abortController.signal,
            method,
            headers: {}
        };

        const callerHasHeader = (headerName: string): boolean => {
            return Object.keys(headers || {}).some((name) => name.toLowerCase() === headerName);
        };
        const hasCallerContentType = callerHasHeader('content-type');

        try {
            if (body !== undefined && method !== Method.GET) {
                bodyType ??= body instanceof FormData ? RequestBodyType.FormData
                    : body !== null && typeof body === 'object' && !(body instanceof Blob)
                        && !(body instanceof URLSearchParams) && !(body instanceof ArrayBuffer) && !ArrayBuffer.isView(body)
                        ? RequestBodyType.JSON : undefined;

                if (typeof body === 'string' && (bodyType === RequestBodyType.FormData || bodyType === RequestBodyType.Urlencoded)) {
                    try {
                        const parsed = JSON.parse(body);
                        if (parsed !== null && typeof parsed === 'object') {
                            body = parsed;
                        }
                    } catch {
                        // Already encoded string bodies can be sent as-is.
                    }
                }

                switch (bodyType) {
                    case RequestBodyType.JSON:
                        body = typeof body === 'string' ? body : JSON.stringify(body instanceof FormData ? convertFormDataToObject(body) : body);
                        break;
                    case RequestBodyType.FormData:
                        if (typeof body === 'string') {
                            try {
                                body = JSON.parse(body);
                            } catch {
                                throw new TypeError('When using FormData bodyType, body must be a FormData instance or JSON-convertible object');
                            }
                        }

                        if (!(body instanceof FormData) && body !== null && typeof body === 'object') {
                            body = convertObjectToFormData(body);
                        } else if (body !== undefined && !(body instanceof FormData)) {
                            throw new TypeError('When using FormData bodyType, body must be a FormData instance or object');
                        }
                        break;
                    case RequestBodyType.Urlencoded:
                        if (body instanceof FormData) {
                            const parameters = new URLSearchParams();
                            body.forEach((value, key) => parameters.append(key, String(value)));
                            body = parameters.toString();
                        } else if (body instanceof URLSearchParams) {
                            body = body.toString();
                        } else if (body !== null && typeof body === 'object') {
                            body = convertObjectToURLSearchParams(body).toString();
                        }
                        break;
                }
            }

            const requestHeaders: {[key: string]: string} = {};
            const setHeaders = (source: {[key: string]: string | number}) => {
                Object.entries(source).forEach(([key, value]) => {
                    requestHeaders[key] = String(value);
                });
            };

            setHeaders(headers || {});
            setHeaders(this.config?.headers || {});
            setHeaders(auth?.getHeaders() || {});
            setHeaders(bodyType ? RequestBodyTypeHeaders[bodyType] || {} : {});
            if (body instanceof FormData && !hasCallerContentType) {
                // Fetch must generate the multipart boundary for this exact body.
                Object.keys(requestHeaders).forEach((key) => {
                    if (key.toLowerCase() === 'content-type') {
                        delete requestHeaders[key];
                    }
                });
            }

            options.headers = requestHeaders;
            if (method !== Method.GET && body !== undefined) {
                options.body = body;
            }

            Object.values(Requester.interceptors).filter(([event, , namespace]) => {
                return (namespace === undefined || namespace === this.namespace) && event === InterceptEvent.PRE_REQUEST;
            }).forEach(([, callback]) => {
                (callback as PreRequestCallback)(requestId, url, options);
            });

            const nativeResponse = await fetch(url, options);
            Object.values(Requester.interceptors).filter(([event, , namespace]) => {
                return (namespace === undefined || namespace === this.namespace) && event === InterceptEvent.PRE_RESPONSE;
            }).forEach(([, callback]) => {
                (callback as PreResponseCallback)(requestId, nativeResponse, url, options);
            });

            const response = new Response(nativeResponse);
            await response.getResponseData();

            Object.values(Requester.interceptors).filter(([event, , namespace]) => {
                return (namespace === undefined || namespace === this.namespace) && event === InterceptEvent.POST_RESPONSE;
            }).forEach(([, callback]) => {
                (callback as PostResponseCallback)(requestId, response, url, options);
            });

            return response;
        } catch (reason) {
            Object.values(Requester.interceptors).filter(([event, , namespace]) => {
                return (namespace === undefined || namespace === this.namespace) && event === InterceptEvent.ERROR;
            }).forEach(([, callback]) => {
                (callback as ErrorCallback)(requestId, reason, url, options);
            });

            throw reason;
        } finally {
            clearTimeout(timeoutInterval);
            signal?.removeEventListener('abort', abortFromCaller);
        }
    }

    post({url, body, bodyType, signal, timeout}: PostRequestConfig) {
        const resolvedBodyType = bodyType === undefined && !(body instanceof FormData) ? RequestBodyType.JSON : bodyType;

        return this.fetch({url, method: Method.POST, body, bodyType: resolvedBodyType, signal, timeout});
    }

    get({url, query, signal, timeout}: GetRequestConfig) {
        if (query && !(query instanceof URLSearchParams)) {
            query = convertObjectToURLSearchParams(query);
        }

        return this.fetch({
            url,
            method: Method.GET,
            query,
            signal,
            timeout
        });
    }

    static post({
                    url,
                    body,
                    bodyType,
                    namespace,
                    config,
                    signal,
                    timeout
                }: PostRequestConfig & InstanceConfig): Promise<RequesterResponse> {
        return this.instance({namespace, config}).post({url, body, bodyType, signal, timeout});
    }

    static get({url, query, namespace, config, signal, timeout}: GetRequestConfig & InstanceConfig): Promise<RequesterResponse> {
        return this.instance({namespace, config}).get({url, query, signal, timeout});
    }
}

export {
    convertObjectToURLSearchParams,
    convertObjectToFormData,
    convertFormDataToObject,
    convertURLSearchParamsToObject
};

export default Requester;
