import StandardObjectType from "@src/type/StandardObjectType";
import RequestBodyType from "@src/enum/RequestBodyType";

type PostRequestConfig = {
    url: string;
    body?: FormData | Blob | URLSearchParams | ArrayBuffer | ArrayBufferView | ReadableStream | string | StandardObjectType | null;
    bodyType?: RequestBodyType,
    signal?: AbortSignal,
    timeout?: number
}

export default PostRequestConfig;
