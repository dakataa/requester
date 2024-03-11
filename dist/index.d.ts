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
        [key: string]: string;
    };
    getQuery(): StandardObjectType;
    getBody(): StandardObjectType;
}

declare enum Method {
    POST = "POST",
    GET = "GET",
    PUT = "PUT"
}

type Request = {
    url: URL | string;
    method?: Method;
    body?: any;
    query?: StandardObjectType | URLSearchParams;
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

declare class Requester {
    private static interceptors;
    static defaults: Config;
    private config;
    constructor(config?: Config);
    static on(event: InterceptEvent, callable: Function): number;
    static off(interceptorId: number): void;
    fetch({ url, method, body, query, signal, auth, headers }: Request): Promise<RequesterResponse>;
    post(url: string, body?: FormData | string | StandardObjectType, bodyType?: RequestBodyType): Promise<RequesterResponse>;
    get(url: string, params: any): void;
}

export { InterceptEvent, Method, RequestBodyType, Requester as default };
