import { AuthTokenStorage } from "@/lib/configureAuth";
import { Url } from "url";

// NOTE: Supports cases where `content-type` is other than `json`
const getBody = <T>(c: Response | Request): Promise<T> => {
  const contentType = c.headers.get("content-type") || "";

  //biome-ignore lint/complexity/useOptionalChain:
  if (contentType && contentType.includes("application/json")) {
    return c.json();
  }

  //biome-ignore lint/complexity/useOptionalChain:
  if (contentType && contentType.includes("application/pdf")) {
    return c.blob() as Promise<T>;
  }

  return c.text() as Promise<T>;
};

// NOTE: Update just base url
const getUrl = (contextUrl: string): string => {
  console.log(
    ...[contextUrl, "👀 [custom-instance.ts:22]: contextUrl"].reverse(),
  );
  const url = new URL(contextUrl);
  const pathname = url.pathname;
  const search = url.search;
  const baseUrl = "http://localhost:3000/api/";

  const requestUrl = new URL(`${baseUrl}${pathname}${search}`);

  console.log(
    ...[
      requestUrl.toString(),
      "👀 [custom-instance.ts:32]: requestUrl.toString()",
    ].reverse(),
  );
  return requestUrl.toString();
};

// NOTE: Add headers
const getHeaders = (headers?: HeadersInit): HeadersInit => {
  const token = AuthTokenStorage.getToken();
  return {
    ...headers,
    // biome-ignore lint/style/useNamingConvention:
    Authorization: token || "",
  };
};
export type BodyType<BodyData> = BodyData & { headers?: any };
type CustomClientProps = {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  params?: Record<string, any>;
  headers?: Record<string, any>;
  data?: BodyType<unknown>;
  signal?: AbortSignal;
};

export const customFetch = async <T>(
  FetchData: CustomClientProps,
): Promise<T> => {
  console.log(FetchData, "👀 [custom-instance.ts:49]: url, options");
  const requestUrl = getUrl(FetchData.url);
  const requestHeaders = getHeaders(FetchData?.headers);

  const requestInit: RequestInit = {
    headers: requestHeaders,
    method: FetchData.method || "GET",
    ...(FetchData.data ? { body: JSON.stringify(FetchData.data) } : {}),
  };

  const request = new Request(requestUrl, requestInit);
  const response = await fetch(request);
  const data = await getBody<T>(response);

  return { status: response.status, data } as T;
};
