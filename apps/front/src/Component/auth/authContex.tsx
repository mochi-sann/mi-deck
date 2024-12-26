// src/contexts/AuthContext.tsx

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchClient } from "../../lib/api/fetchClient";

interface User {
  id: string;
  name: string;
  email: string;
  // 他のユーザー情報があれば追加
}

export interface AuthContextType {
  authToken: string | null;
  user: User | null;
  isAuth: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  authToken: null,
  user: null,
  isAuth: false,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthTokenStorageKey = "mi-deck-auth-token";
export function setStoredUser(user: string | null) {
  if (user) {
    localStorage.setItem(AuthTokenStorageKey, user);
  } else {
    localStorage.removeItem(AuthTokenStorageKey);
  }
}
export function getStoredUser() {
  return localStorage.getItem(AuthTokenStorageKey);
}

export const AuthProvider: React.FC<AuthProviderProps> = (props) => {
  // const [authToken, setAuthToken, removeAuthToken] = useLocalStorage<
  //   string | null
  // >(AuthTokenStorageKey, null);
  const [user, setUser] = useState<User | null>(null);
  const authToken = getStoredUser();

  useEffect(() => {
    if (authToken) {
      fetchClient
        .GET("/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        .then(async (response) => {
          console.log(
            ...[response, "👀 [authContex.tsx:53]: response"].reverse(),
          );
          if (!response.data || response.response.status !== 200) {
            console.log("認証エラー");
            // logout();
            throw new Error("認証エラー");
          }
          console.log("認証した", response.data);
          const data: User = response.data;
          setUser(data);
        })
        .catch(() => {
          console.log("認証エラー");
          // logout();
        });
    }
  }, [authToken]);

  const login = (token: string) => {
    console.log(...[token, "👀 [authContex.tsx:73]: token"].reverse());
    setStoredUser(token);
  };

  const logout = async () => {
    setStoredUser(null);
    setUser(null);
    return null;
  };
  const reload = () => {
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        user,
        login,
        logout,
        isAuth: !!authToken,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
