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
        const id = Math.floor(Math.random() * Date.now())
        this.interceptors[id] = [event, callable, namespace];
        return id;
    };

    static off(interceptorId: number) {
        if (this.interceptors[interceptorId] !== undefined) {
            delete this.interceptors[interceptorId];
        }

        return this;
    }

    fetch({
              url,
              method = Method.GET,
              body,
              query,
              signal,
              auth,
              headers
          }: Request): Promise<Response> {

        url = new URL(url, this.config?.baseURL || undefined);
        auth ??= this.config?.authorization;

        const requestId = Math.floor(Math.random() * Date.now());

        const search = new URLSearchParams({
                ...(query ? Object.fromEntries(query instanceof URLSearchParams ? query : (query instanceof FormData ? convertObjectToURLSearchParams(convertFormDataToObject(query)) : new URLSearchParams(query))) : {}),
                ...(Object.fromEntries((url as URL).searchParams)),
                ...(new URLSearchParams(auth?.getQuery() || {}))
            }
        );

        url.search = search.toString();

        const abortController = new AbortController();
        let options: any = {
            signal: signal || abortController.signal,
            method: method || Method.GET,
            headers: {
                ...(headers || {}),
                ...(auth?.getHeaders() || {}),
                ...(this.config?.headers || {})
            }
        };

        switch (method) {
            case Method.POST: {
                options = {
                    ...options,
                    body: body
                }
            }
        }

        const timeoutInterval = setTimeout(() => abortController?.abort(), this.config.timeout || 30000);

        Object.values(Requester.interceptors).filter(([event, , namespace]) => {
            return (namespace === undefined || namespace === this.namespace) && event === InterceptEvent.PRE_REQUEST;
        }).forEach(([, callback]) => {
            (callback as PreRequestCallback)(requestId, url, options);
        });


        return new Promise<Response>((resolve, reject) => {
            fetch(url, options)
                .then(response => {
                    Object.values(Requester.interceptors).filter(([event, , namespace]) => {
                        return (namespace === undefined || namespace === this.namespace) && event === InterceptEvent.PRE_RESPONSE;
                    }).forEach(([, callback]) => {
                        (callback as PreResponseCallback)(requestId, response, url, options);
                    });

                    resolve(new Response(response));
                })
                .catch((error) => reject(error))
                .finally(() => clearTimeout(timeoutInterval));
        }).then((response) => {
            return new Promise<Response>((resolve) => response.getResponseData().then(() => {
                resolve(response)

                Object.values(Requester.interceptors).filter(([event, , namespace]) => {
                    return (namespace === undefined || namespace === this.namespace) && event === InterceptEvent.POST_RESPONSE;
                }).forEach(([, callback]) => {
                    (callback as PostResponseCallback)(requestId, response, url, options);
                });
            }))
        }).catch((reason) => {
            Object.values(Requester.interceptors).filter(([event, , namespace]) => {
                return (namespace === undefined || namespace === this.namespace) && event === InterceptEvent.ERROR;
            }).forEach(([, callback]) => {
                (callback as ErrorCallback)(requestId, reason, url, options);
            });

            return Promise.reject(reason);
        });
    }

    post({url, body, bodyType, signal}: PostRequestConfig) {
        let bodyObject = null;
        bodyType ||= RequestBodyType.JSON;

        switch (typeof body) {
            case 'string': {
                try {
                    bodyObject = JSON.parse(body);
                } catch (e) {

                }
                break;
            }
            case 'object': {
                bodyObject = (body instanceof FormData) ? convertFormDataToObject(body) : body;
                break;
            }
        }

        const formData = bodyObject ? convertObjectToFormData(bodyObject) : null;

        switch (bodyType) {
            case RequestBodyType.Urlencoded: {
                body = bodyObject ? (convertObjectToURLSearchParams(bodyObject)).toString() : body;
                break;
            }
            case RequestBodyType.FormData: {
                body = formData || body;
                break;
            }
            case RequestBodyType.JSON: {
                body = bodyObject ? JSON.stringify(bodyObject) : body;
                break;
            }
            default: {

            }
        }

        return this.fetch({
            url,
            method: Method.POST,
            body,
            headers: RequestBodyTypeHeaders[bodyType],
            signal
        });
    }

    get({url, query, signal}: GetRequestConfig) {
        if (query && !(query instanceof URLSearchParams)) {
            query = convertObjectToURLSearchParams(query);
        }

        return this.fetch({
            url,
            method: Method.GET,
            query,
            signal
        });
    }

    static post({
                    url,
                    body,
                    bodyType,
                    namespace,
                    config,
                    signal
                }: PostRequestConfig & InstanceConfig): Promise<RequesterResponse> {
        return this.instance({namespace, config}).post({url, body, bodyType, signal});
    }

    static get({url, query, namespace, config}: GetRequestConfig & InstanceConfig): Promise<RequesterResponse> {
        return this.instance({namespace, config}).get({url, query});
    }
}

export {
    convertObjectToURLSearchParams,
    convertObjectToFormData,
    convertFormDataToObject,
    convertURLSearchParamsToObject
};

export default Requester;
