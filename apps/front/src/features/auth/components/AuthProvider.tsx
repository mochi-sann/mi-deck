import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useStorage } from "@/lib/storage/context";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import { clientAuthManager } from "../api/clientAuth";
import type { AuthError } from "../types";

interface AuthContextValue {
  // State
  isAuthenticated: boolean;
  currentServer?: MisskeyServerConnection;
  servers: MisskeyServerConnection[];
  isLoading: boolean;
  error?: AuthError | string;

  // Actions
  initiateAuth: (origin: string) => Promise<string>;
  completeAuth: (
    uuid: string,
    sessionToken: string,
  ) => Promise<{ success: boolean; error?: string }>;
  addServerWithToken: (
    origin: string,
    token: string,
  ) => Promise<{ success: boolean; error?: string }>;
  switchServer: (serverId: string) => Promise<void>;
  refreshServerInfo: (serverId: string) => Promise<void>;
  removeServer: (serverId: string) => Promise<void>;
  validateCurrentToken: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const storage = useStorage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | string | undefined>();

  const currentServer = storage.servers.find(
    (s) => s.id === storage.currentServerId,
  );
  const isAuthenticated = !!currentServer && !!currentServer.accessToken;

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(undefined);

        // Clean up expired auth sessions
        clientAuthManager.cleanupExpiredSessions();

        // Validate current server token if exists
        if (currentServer?.id) {
          const isValid = await clientAuthManager.validateToken(
            currentServer.id,
          );
          if (!isValid) {
            console.warn("Current server token is invalid");
            // Could automatically refresh or remove invalid server here
          }
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Authentication initialization failed",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (!storage.isLoading) {
      initialize();
    }
  }, [storage.isLoading, currentServer?.id]);

  const initiateAuth = async (origin: string): Promise<string> => {
    try {
      setError(undefined);
      const uuid = await clientAuthManager.initiateAuth(origin);
      return uuid;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to initiate authentication";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleAuthSuccess = async (result: {
    success: boolean;
    server?: MisskeyServerConnection;
    error?: string;
  }) => {
    if (result.success && result.server) {
      // Refresh storage to get the new server
      await storage.refresh();

      // Set as current server if it's the first one
      if (storage.servers.length === 0) {
        await storage.setCurrentServer(result.server.id);
      }
    }
    return { success: result.success, error: result.error };
  };

  const completeAuth = async (uuid: string, sessionToken: string) => {
    try {
      setError(undefined);
      const result = await clientAuthManager.completeAuth(uuid, sessionToken);

      return await handleAuthSuccess(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to complete authentication";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  const addServerWithToken = async (
    origin: string,
    token: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(undefined);
      const result = await clientAuthManager.addServerWithToken(origin, token);

      return await handleAuthSuccess(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add server with token";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const switchServer = async (serverId: string) => {
    try {
      setError(undefined);
      await storage.setCurrentServer(serverId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to switch server";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshServerInfo = async (serverId: string) => {
    try {
      setError(undefined);
      await clientAuthManager.refreshServerInfo(serverId);
      await storage.refresh();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh server info";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const removeServer = async (serverId: string) => {
    try {
      setError(undefined);
      await storage.deleteServer(serverId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove server";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const validateCurrentToken = async (): Promise<boolean> => {
    if (!currentServer?.id) {
      return false;
    }

    try {
      return await clientAuthManager.validateToken(currentServer.id);
    } catch (err) {
      console.error("Token validation failed:", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      setError(undefined);

      // Clear current server
      await storage.setCurrentServer(undefined);

      // Optionally remove all servers (complete logout)
      // For now, just clear current server selection
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to logout";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value: AuthContextValue = {
    isAuthenticated,
    currentServer,
    servers: storage.servers,
    isLoading: storage.isLoading || isLoading,
    error: error || storage.error,
    initiateAuth,
    completeAuth,
    addServerWithToken,
    switchServer,
    refreshServerInfo,
    removeServer,
    validateCurrentToken,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
