import StandardObjectType from "@src/type/StandardObjectType";
import RequestBodyType from "@src/enum/RequestBodyType";

type PostRequestConfig = {
    url: string;
    body?: FormData | string | StandardObjectType;
    bodyType?: RequestBodyType
}

export default PostRequestConfig;
