declare enum AppendParameterTo {
    Header = 0,
    Query = 1,
    Body = 2
}

type StandardObjectType = {
    [key: string]: any;
};

interface AuthorizationInterface {
    appendTo: AppendParameterTo;
    getHeaders(): {
        [key: string]: string | number;
    };
    getQuery(): StandardObjectType;
    getBody(): StandardObjectType;
}

declare enum Method {
    POST = "POST",
    GET = "GET",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH"
}

type Request = {
    url: URL | string;
    method?: Method;
    body?: any;
    query?: StandardObjectType | URLSearchParams | FormData;
    signal?: AbortSignal | null;
    auth?: AuthorizationInterface | null;
    headers?: {
        [key: string]: string;
    };
    timeout?: number;
};

declare class RequesterResponse {
    response: Response;
    status: number;
    data: any;
    constructor(response: Response);
    getData(): Promise<any>;
    getHeaders(): Headers;
}

declare enum InterceptEvent {
    PRE_REQUEST = 0,
    POST_REQUEST = 1,
    PRE_RESPONSE = 2,
    POST_RESPONSE = 3
}

declare enum RequestBodyType {
    FormData = "form-data",
    Urlencoded = "x-www-form-urlencoded",
    JSON = "raw-json",
    Text = "raw-text",
    Xml = "raw-xml",
    Html = "raw-html",
    Javascript = "raw-javascript",
    Binary = "binary"
}

type Config = {
    baseURL?: URL | string;
    authorization?: AuthorizationInterface;
    headers?: {
        [key: string]: string;
    };
    timeout?: number;
};

declare const convertFormDataToObject: (formData: FormData) => StandardObjectType;
declare const convertObjectToFormData: (data: StandardObjectType, formData?: FormData, parentKeys?: string[]) => FormData;
declare const convertObjectToURLSearchParams: (data: StandardObjectType) => URLSearchParams;
declare const convertURLSearchParamsToObject: (searchData: URLSearchParams) => object;

declare class Requester {
    private static interceptors;
    static defaults: Config;
    private config;
    constructor(config?: Config);
    static on(event: InterceptEvent, callable: Function): number;
    static off(interceptorId: number): void;
    fetch({ url, method, body, query, signal, auth, headers }: Request): Promise<RequesterResponse>;
    post(url: string, body?: FormData | string | StandardObjectType, bodyType?: RequestBodyType): Promise<RequesterResponse>;
    get(url: string, query: StandardObjectType | URLSearchParams): Promise<RequesterResponse>;
}

declare abstract class AbstractAuthorization implements AuthorizationInterface {
    abstract appendTo: AppendParameterTo;
    getBody(): StandardObjectType;
    getHeaders(): {
        [key: string]: string | number;
    };
    getQuery(): StandardObjectType;
}

declare class BearerToken extends AbstractAuthorization {
    appendTo: AppendParameterTo;
    token: string;
    constructor(token: string);
    getHeaders(): {
        [p: string]: string;
    };
}

declare class BasicAuth extends AbstractAuthorization {
    appendTo: AppendParameterTo;
    username: string;
    password: string;
    constructor(username: string, password: string);
    getHeaders(): {
        [key: string]: string;
    };
}

declare class APIKey extends AbstractAuthorization {
    appendTo: AppendParameterTo;
    key: string;
    value: string;
    constructor(key: string | undefined, value: string, appendTo: AppendParameterTo);
    getHeaders(): {
        [p: string]: string | number;
    };
    getQuery(): {
        [p: string]: string | number;
    };
}

export { APIKey, BasicAuth, BearerToken, InterceptEvent, Method, RequestBodyType, convertFormDataToObject, convertObjectToFormData, convertObjectToURLSearchParams, convertURLSearchParamsToObject, Requester as default };
