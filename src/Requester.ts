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
    convertFormDataToObject,
    convertObjectToFormData,
    convertObjectToURLSearchParams,
    convertURLSearchParamsToObject
} from "@src/helper/DataHelper";


class Requester {

    private config: Config;

    private static interceptors: Array<[InterceptEvent, Function]> = [];

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
    }

    static on(event: InterceptEvent, callable: Function): number {
        return this.interceptors.push([event, callable]);
    };

    static off(interceptorId: number): void {
        if (this.interceptors[interceptorId] === undefined)
            return;

        this.interceptors.splice(interceptorId, 1);
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

        Requester.interceptors.filter(([i]) => i === InterceptEvent.PRE_REQUEST).forEach(([i, callback]) => {
            options = callback(options);
        });

        return new Promise<Response>((resolve, reject) => {
            fetch(url, options)
                .then(response => {
                    Requester.interceptors.filter(([i]) => i === InterceptEvent.PRE_RESPONSE).forEach(([i, callback]) => {
                        response = callback(response);
                    });

                    resolve(new Response(response));

                    Requester.interceptors.filter(([i]) => i === InterceptEvent.POST_RESPONSE).forEach(([i, callback]) => {
                        response = callback(response);
                    });
                })
                .catch((error) => reject(error))
                .finally(() => clearTimeout(timeoutInterval));
        }).then((response) => {
            return new Promise<Response>((resolve) => response.getResponseData().then((data) => {
                resolve(response)
            }))
        });
    }

    post({url, body, bodyType}: PostRequestConfig) {
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
            headers: RequestBodyTypeHeaders[bodyType]
        });
    }

    get({url, query}: GetRequestConfig) {
        if (query && !(query instanceof URLSearchParams)) {
            query = convertObjectToURLSearchParams(query);
        }

        return this.fetch({
            url,
            method: Method.GET,
            query
        });
    }

    static post({url, body, bodyType, namespace, config}: PostRequestConfig & InstanceConfig): Promise<RequesterResponse> {
        return this.instance({namespace, config}).post({url, body, bodyType});
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
