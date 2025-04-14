import { components } from "./api/type";
import { configureAuth } from "./auth/authLib";
import { getuserInfo, handleUserResponse } from "./_authInternal"; // Import internal functions

const AuthTokenStorageKey = "mi-deck-auth-token";
export const AuthTokenStorage = {
  getToken: () =>
    JSON.parse(localStorage.getItem(AuthTokenStorageKey) || "null"),
  setToken: (token: string) =>
    localStorage.setItem(AuthTokenStorageKey, JSON.stringify(token)),
  clearToken: () => window.localStorage.removeItem(AuthTokenStorageKey),
};

export type LoginCredentials = components["schemas"]["LoginDto"];

export type SignUpCredentials = components["schemas"]["SignUpDto"];
export type UserType = {
  id: string;
  email: string;
  name: string;
  isAuth: boolean;
  avatarUrl: string;
};

// Moved getuserInfo to _authInternal.ts

export async function userFn() {
  console.log("userFn");
  const token = AuthTokenStorage.getToken();
  console.log(...[token, "👀 [configureAuth.ts:39]: token"].reverse());
  if (!token || token == null) {
    return null;
  }
  return await getuserInfo(token);
}

// Moved handleUserResponse to _authInternal.ts

export async function loginFn(data: LoginCredentials) {
  const response = await fetchClient.POST("/v1/auth/login", {
    body: data,
  });
  if (response.response.status >= 400 || !response.data?.accessToken) {
    throw new Error("Login failed");
  }
  // Set token here directly
  AuthTokenStorage.setToken(response.data.accessToken);
  const user = await getuserInfo(response.data.accessToken); // Use getuserInfo directly
  return user;
}

export async function registerFn(data: SignUpCredentials) {
  const response = await fetchClient.POST("/v1/auth/signUp", {
    body: data,
  });
  if (response.response.status >= 400 || !response.data?.accessToken) {
    throw new Error("Login failed");
  }
  // Set token here directly
  AuthTokenStorage.setToken(response.data.accessToken);
  const user = await getuserInfo(response.data.accessToken); // Use getuserInfo directly
  return user;
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
