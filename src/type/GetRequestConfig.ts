import StandardObjectType from "@src/type/StandardObjectType";

type GetRequestConfig = {
    url: string;
    query?: StandardObjectType | URLSearchParams;
    signal?: AbortSignal
}

export default GetRequestConfig;
