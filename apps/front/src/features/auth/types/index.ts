export enum AuthErrorType {
  // biome-ignore lint/style/useNamingConvention: 定数なので除外
  NETWORK_ERROR = "NETWORK_ERROR",
  // biome-ignore lint/style/useNamingConvention: 定数なので除外
  INVALID_SERVER_URL = "INVALID_SERVER_URL",
  // biome-ignore lint/style/useNamingConvention: 定数なので除外
  AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
  // biome-ignore lint/style/useNamingConvention: 定数なので除外
  CORS_ERROR = "CORS_ERROR",
  // biome-ignore lint/style/useNamingConvention: 定数なので除外
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  // biome-ignore lint/style/useNamingConvention: 定数なので除外
  SERVER_UNAVAILABLE = "SERVER_UNAVAILABLE",
  // biome-ignore lint/style/useNamingConvention: 定数なので除外
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
}

export interface MisskeyAuthResponse {
  ok: boolean;
  token?: string;
  // biome-ignore lint/suspicious/noExplicitAny: わからん
  user?: any;
  error?: string;
}
