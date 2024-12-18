// src/contexts/AuthContext.tsx

import { ReactNode, createContext, useEffect, useState } from "react";

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
  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (authToken) {
      // トークンを使用してユーザー情報を取得
      fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("認証エラー");
          }
          const data: User = await response.json();
          setUser(data);
        })
        .catch(() => {
          setAuthToken(null);
          setUser(null);
          localStorage.removeItem("token");
        });
    }
  }, [authToken]);

  const login = (token: string) => {
    setAuthToken(token);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("token");
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
      {props.children}
    </AuthContext.Provider>
  );
};
