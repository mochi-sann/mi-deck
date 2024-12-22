// src/contexts/AuthContext.tsx

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocalStorage } from "usehooks-ts";
import { fetchClient } from "../../lib/api/fetchClient";

interface User {
  id: string;
  name: string;
  email: string;
  // 他のユーザー情報があれば追加
}

interface AuthContextType {
  authToken: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  authToken: null,
  user: null,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = (props) => {
  const [authToken, setAuthToken, removeAuthToken] = useLocalStorage<
    string | null
  >("jwt-token", null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (authToken) {
      fetchClient
        .GET("/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        .then(async (response) => {
          if (
            !response.error ||
            !response.data ||
            response.response.status !== 200
          ) {
            console.log("認証エラー");
            throw new Error("認証エラー");
          }
          console.log("認証した", response.data);
          const data: User = response.data;
          setUser(data);
        })
        .catch(() => {
          console.log("認証エラー");
          logout();
        });
    }
  }, [authToken]);

  const login = (token: string) => {
    setAuthToken(token);
    setAuthToken(token);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    removeAuthToken();
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        user,
        login,
        logout,
      }}
    >
      <div>authToken: {authToken}</div>
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
