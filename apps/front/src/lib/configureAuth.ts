import { AuthTokenStorageKey } from "@/Component/auth/authContex";
import { configureAuth } from "react-query-auth";
import { fetchClient } from "./api/fetchClient";
import { components } from "./api/type";
export const AuthTokenStorage = {
  getToken: () =>
    JSON.parse(window.localStorage.getItem(AuthTokenStorageKey) || "null"),
  setToken: (token: string) =>
    window.localStorage.setItem(AuthTokenStorageKey, JSON.stringify(token)),
  clearToken: () => window.localStorage.removeItem(AuthTokenStorageKey),
};

export type LoginCredentials = components["schemas"]["LoginDto"];

export type SignUpCredentials = components["schemas"]["SignUpDto"];

async function userFn() {
  const token = AuthTokenStorage.getToken();
  const userResponse = await fetchClient.GET("/v1/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return userResponse.data ?? null;
}

async function handleUserResponse(jwt: string) {
  AuthTokenStorage.setToken(jwt);
  const user = await userFn();
  return user;
}

async function loginFn(data: LoginCredentials) {
  const response = await fetchClient.POST("/v1/auth/login", {
    body: data,
  });
  if (response.response.status >= 400 || !response.data?.access_token) {
    throw new Error("Login failed");
  }
  const user = await handleUserResponse(response.data?.access_token);
  return user;
}

async function registerFn(data: SignUpCredentials) {
  const response = await fetchClient.POST("/v1/auth/signUp", {
    body: data,
  });
  if (response.response.status >= 400 || !response.data?.access_token) {
    throw new Error("Login failed");
  }
  const user = await handleUserResponse(response.data.access_token);
  return user;
}

async function logoutFn() {
  AuthTokenStorage.clearToken();
}

export const { useUser, useLogin, useRegister, useLogout, AuthLoader } =
  configureAuth({
    userFn,
    loginFn,
    registerFn,
    logoutFn,
  });
