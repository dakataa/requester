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
    convertURLSearchParamsToObject,
    mergeURLSearchParams
} from "@src/helper/DataHelper";

const isReadableStream = (body: unknown): body is ReadableStream =>
    typeof ReadableStream !== 'undefined' && body instanceof ReadableStream;

const isBlob = (body: unknown): body is Blob =>
    typeof Blob !== 'undefined' && body instanceof Blob;

const isFormData = (body: unknown): body is FormData =>
    typeof FormData !== 'undefined' && body instanceof FormData;

const isRawBody = (body: unknown): boolean =>
    isBlob(body) || body instanceof URLSearchParams || body instanceof ArrayBuffer
    || ArrayBuffer.isView(body) || isReadableStream(body);

const formDataHasFiles = (body: FormData): boolean => {
    let hasFiles = false;
    body.forEach(value => {
        if (typeof value !== 'string') {
            hasFiles = true;
        }
    });
    return hasFiles;
};

const formDataHasUnsupportedJSONKeys = (body: FormData): boolean => {
    let unsupported = false;
    // A path that holds nested fields cannot also hold a value, e.g. `user` and `user[name]`.
    const pathKinds = new Map<string, 'object' | 'value'>();
    body.forEach((_, key) => {
        if (!/^[\w-]+(?:\[[\w-]+\])*(?:\[\])?$/.test(key)) {
            unsupported = true;
            return;
        }

        const parts = key.match(/[\w-]+/g) ?? [];
        parts.forEach((_, index) => {
            // Valid keys never contain '.', so it is safe as a path separator.
            const path = parts.slice(0, index + 1).join('.');
            const kind = index < parts.length - 1 ? 'object' : 'value';
            const previous = pathKinds.get(path);
            if (previous && previous !== kind) {
                unsupported = true;
            }
            pathKinds.set(path, kind);
        });
    });
    return unsupported;
};


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

        if (query instanceof URLSearchParams || isFormData(query)) {
            const parameters = new URLSearchParams();
            query.forEach((value, key) => {
                parameters.append(key, String(value));
            });
            mergeURLSearchParams(search, parameters);
        } else if (query) {
            mergeURLSearchParams(search, convertObjectToURLSearchParams(query));
        }
        mergeURLSearchParams(search, convertObjectToURLSearchParams(auth?.getQuery() || {}));

        url.search = search.toString();
        const abortController = new AbortController();
        const effectiveTimeout = timeout === 0 ? 30000 : (timeout ?? this.config?.timeout) || 30000;
        let timeoutInterval: ReturnType<typeof setTimeout> | undefined;
        const options: any = {
            signal: signal || abortController.signal,
            method,
            headers: {}
        };

        try {
            if (body !== undefined && method !== Method.GET) {
                bodyType ??= isFormData(body) ? RequestBodyType.FormData
                    : body !== null && typeof body === 'object' && !isBlob(body)
                        && !(body instanceof URLSearchParams) && !(body instanceof ArrayBuffer) && !ArrayBuffer.isView(body)
                        && !isReadableStream(body)
                        ? RequestBodyType.JSON : undefined;

                if (isFormData(body) && formDataHasFiles(body) && bodyType !== RequestBodyType.FormData) {
                    throw new TypeError('FormData containing files requires FormData bodyType');
                }
                if (isFormData(body) && formDataHasUnsupportedJSONKeys(body) && bodyType !== RequestBodyType.FormData) {
                    throw new TypeError('FormData field names require FormData bodyType');
                }

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
                        body = body === null ? undefined : typeof body === 'string' ? body : JSON.stringify(isFormData(body) ? convertFormDataToObject(body) : body);
                        break;
                    case RequestBodyType.FormData:
                        if (typeof body === 'string') {
                            try {
                                body = JSON.parse(body);
                            } catch {
                                throw new TypeError('When using FormData bodyType, body must be a FormData instance or JSON-convertible object');
                            }
                        }

                        if (!isFormData(body) && body !== null && typeof body === 'object') {
                            body = convertObjectToFormData(body);
                        } else if (body !== undefined && !isFormData(body)) {
                            throw new TypeError('When using FormData bodyType, body must be a FormData instance or object');
                        }
                        break;
                    case RequestBodyType.Urlencoded:
                        if (isFormData(body)) {
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
            const deleteHeader = (name: string) => {
                const existing = Object.keys(requestHeaders).find(key => key.toLowerCase() === name.toLowerCase());
                if (existing) {
                    delete requestHeaders[existing];
                }
            };
            const setHeaders = (source: {[key: string]: string | number}) => {
                Object.entries(source).forEach(([key, value]) => {
                    deleteHeader(key);
                    requestHeaders[key] = String(value);
                });
            };

            setHeaders(this.config?.headers || {});
            setHeaders(bodyType ? RequestBodyTypeHeaders[bodyType] || {} : {});
            if (isFormData(body) || (bodyType === undefined &&
                (body instanceof URLSearchParams || (isBlob(body) && Boolean(body.type))))) {
                // Fetch generates the multipart boundary or infers the native body's type.
                deleteHeader('content-type');
            }
            setHeaders(headers || {});
            setHeaders(auth?.getHeaders() || {});

            options.headers = requestHeaders;
            if (method !== Method.GET && body !== undefined) {
                options.body = body;
                if (isReadableStream(body)) {
                    options.duplex = 'half';
                }
            }

            Object.values(Requester.interceptors).filter(([event, , namespace]) => {
                return (namespace === undefined || namespace === this.namespace) && event === InterceptEvent.PRE_REQUEST;
            }).forEach(([, callback]) => {
                (callback as PreRequestCallback)(requestId, url, options);
            });

            if (!signal && Number.isFinite(effectiveTimeout)) {
                timeoutInterval = setTimeout(() => {
                    const reason = typeof DOMException !== 'undefined'
                        ? new DOMException('Request timed out', 'TimeoutError')
                        : Object.assign(new Error('Request timed out'), {name: 'TimeoutError'});
                    abortController.abort(reason);
                }, Math.min(effectiveTimeout, 2147483647));
            }
            let nativeResponse: globalThis.Response;
            try {
                nativeResponse = await fetch(url, options);
            } finally {
                if (timeoutInterval !== undefined) {
                    clearTimeout(timeoutInterval);
                }
            }
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
                try {
                    (callback as PostResponseCallback)(requestId, response, url, options);
                } catch (error) {
                    console.error('POST_RESPONSE interceptor failed', error);
                }
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
            if (timeoutInterval !== undefined) {
                clearTimeout(timeoutInterval);
            }
        }
    }

    post({url, body, bodyType, signal, timeout}: PostRequestConfig) {
        const resolvedBodyType = bodyType === undefined
            ? isFormData(body) && (formDataHasFiles(body) || formDataHasUnsupportedJSONKeys(body)) ? RequestBodyType.FormData
                : isRawBody(body) ? undefined : RequestBodyType.JSON
            : bodyType;

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
