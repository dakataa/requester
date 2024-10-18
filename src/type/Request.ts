import AuthorizationInterface from "@src/component/authorization/AuthorizationInterface";
import Method from "@src/enum/Method";
import StandardObjectType from "@src/type/StandardObjectType";

export type Request = {
    url: URL | string;
    method?: Method;
    body?: any;
    query?: StandardObjectType | URLSearchParams | FormData;
    signal?: AbortSignal | null;
    auth?: AuthorizationInterface | null;
    headers?: {[key: string]: string};
    timeout?: number;
}

export default Request;
