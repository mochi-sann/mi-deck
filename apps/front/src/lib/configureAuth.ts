// Server API removed - client-side auth only
import { configureAuth } from "./auth/authLib";

const AuthTokenStorageKey = "mi-deck-auth-token";
export const AuthTokenStorage = {
  getToken: () =>
    JSON.parse(localStorage.getItem(AuthTokenStorageKey) || "null"),
  setToken: (token: string) =>
    localStorage.setItem(AuthTokenStorageKey, JSON.stringify(token)),
  clearToken: () => window.localStorage.removeItem(AuthTokenStorageKey),
};

// Legacy server types - no longer used in client-side app
export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = {
  email: string;
  password: string;
  name: string;
};
export type UserType = {
  id: string;
  email: string;
  name: string;
  isAuth: boolean;
  avatarUrl: string;
};

// Legacy server auth function - no longer used
export const getuserInfo = async (jwt: string): Promise<UserType | null> => {
  console.warn("getuserInfo called but server auth is disabled");
  return null;
};
export async function userFn() {
  console.log("userFn");
  const token = AuthTokenStorage.getToken();
  console.log(...[token, "👀 [configureAuth.ts:39]: token"].reverse());
  if (!token || token == null) {
    return null;
  }
  return await getuserInfo(token);
}

export async function handleUserResponse(jwt: string) {
  AuthTokenStorage.setToken(jwt);
  const user = await getuserInfo(jwt);
  return user;
}

export async function loginFn(data: LoginCredentials) {
  console.warn("loginFn called but server auth is disabled");
  throw new Error("Server login is disabled - use Misskey server auth instead");
}

export async function registerFn(data: SignUpCredentials) {
  console.warn("registerFn called but server auth is disabled");
  throw new Error(
    "Server registration is disabled - use Misskey server auth instead",
  );
}

export async function logoutFn() {
  // リロードする
  AuthTokenStorage.clearToken();
  window.location.reload();
}

export const { useUser, useLogin, useRegister, useLogout, AuthLoader } =
  configureAuth({
    userFn,
    loginFn,
    registerFn,
    logoutFn,
  });
