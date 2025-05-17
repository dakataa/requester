import Response from "@src/Response";

export type PreRequestCallback = (requestId: number, url: URL | string, options: any) => void;
export type PreResponseCallback = (requestId: number, response: globalThis.Response, url: URL | string, options: any) => void;
export type PostResponseCallback = (requestId: number, response: Response, url: URL | string, options: any) => void;
export type ErrorCallback = (requestId: number, reason: any, url: URL | string, options: any) => void;
