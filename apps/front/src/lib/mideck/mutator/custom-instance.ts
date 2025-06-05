import { AuthTokenStorage } from "../../configureAuth";

export const customInstance = async <T>({
  url,
  method,
  params,
  data,
  headers,
}: {
  url: string;
  method: string;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}): Promise<T> => {
  const token = AuthTokenStorage.getToken();
  const response = await fetch(`${url}${params ? `?${new URLSearchParams(params)}` : ""}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}; 