import { configureAuth } from "react-query-auth";
import { fetchClient } from "./api/fetchClient";
import { components } from "./api/type";

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
};

const getuserInfo = async (jwt: string): Promise<UserType | null> => {
  const userResponse = await fetchClient.GET("/v1/auth/me", {
    headers: {
      authorization: `Bearer ${jwt}`,
    },
  });
  if (userResponse.response.status >= 400 || !userResponse.data?.id) {
    console.log(userResponse.response.status);
    // throw new Error("Login failed");
    return null;
  }
  return userResponse.data
    ? { isAuth: !!userResponse.data.id, ...userResponse.data }
    : null;
};
async function userFn() {
  console.log("userFn");
  const token = AuthTokenStorage.getToken();
  console.log(...[token, "👀 [configureAuth.ts:39]: token"].reverse());
  if (!token || token == null) {
    return null;
  }
  return await getuserInfo(token);
}

async function handleUserResponse(jwt: string) {
  AuthTokenStorage.setToken(jwt);
  const user = await getuserInfo(jwt);
  return user;
}

async function loginFn(data: LoginCredentials) {
  const response = await fetchClient.POST("/v1/auth/login", {
    body: data,
  });
  if (response.response.status >= 400 || !response.data?.accessToken) {
    throw new Error("Login failed");
  }
  const user = await handleUserResponse(response.data?.accessToken);
  return user;
}

async function registerFn(data: SignUpCredentials) {
  const response = await fetchClient.POST("/v1/auth/signUp", {
    body: data,
  });
  if (response.response.status >= 400 || !response.data?.accessToken) {
    throw new Error("Login failed");
  }
  const user = await handleUserResponse(response.data.accessToken);
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
