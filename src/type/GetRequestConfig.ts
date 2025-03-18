import StandardObjectType from "@src/type/StandardObjectType";

type GetRequestConfig = {
    url: string;
    query?: StandardObjectType | URLSearchParams;
}

export default GetRequestConfig;
