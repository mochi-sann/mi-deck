export enum AuthErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",

  INVALID_SERVER_URL = "INVALID_SERVER_URL",

  AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",

  CORS_ERROR = "CORS_ERROR",

  TIMEOUT_ERROR = "TIMEOUT_ERROR",

  SERVER_UNAVAILABLE = "SERVER_UNAVAILABLE",

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

  user?: any;
  error?: string;
}
