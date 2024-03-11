import AuthorizationInterface from "@src/component/authorization/AuthorizationInterface";

export type Config = {
    baseURL?: URL | string;
    authorization?: AuthorizationInterface;
    headers?: {[key:string]: string};
    timeout?: number;
}

export default Config;
