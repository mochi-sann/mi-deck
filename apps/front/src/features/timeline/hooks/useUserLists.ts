import { APIClient } from "misskey-js/api.js";
import { useCallback, useEffect, useState } from "react";

export interface UserList {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  userIds: string[];
  createdAt: string;
}

export function useUserLists(origin: string, token: string) {
  const [lists, setLists] = useState<UserList[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValidConfig =
    origin && token && origin.trim() !== "" && token.trim() !== "";

  if (!isValidConfig && !error) {
    setError(new Error("サーバーまたは認証情報が設定されていません。"));
  }

  const fetchLists = useCallback(async () => {
    if (isLoading || !isValidConfig) return;

    setIsLoading(true);
    try {
      const client = new APIClient({
        origin,
        credential: token,
      });

      const res = await (client as any).request("users/lists/list", {});

      if (Array.isArray(res)) {
        setLists(res);
      } else {
        setError(new Error("Invalid response format"));
      }
    } catch (err) {
      console.error("User lists fetch error:", {
        origin,
        error: err,
      });

      let errorMessage = "Unknown error occurred";

      if (err instanceof Error) {
        if (
          err.message.includes("fetch") ||
          err.message.includes("NetworkError")
        ) {
          errorMessage = `Network error: Unable to connect to ${origin}`;
        } else if (err.message.includes("timeout")) {
          errorMessage = `Timeout error: ${origin} is taking too long to respond`;
        } else if (
          err.message.includes("401") ||
          err.message.includes("Unauthorized")
        ) {
          errorMessage = "Authentication failed. Please re-login.";
        } else if (
          err.message.includes("403") ||
          err.message.includes("Forbidden")
        ) {
          errorMessage = "Access denied. Check your permissions.";
        } else if (err.message.includes("404")) {
          errorMessage = "Lists not found or server unreachable.";
        } else if (err.message.includes("500")) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = err.message;
        }
      } else if (typeof err === "object" && err !== null && "code" in err) {
        const misskeyError = err as { code: string; message?: string };
        switch (misskeyError.code) {
          case "RATE_LIMIT_EXCEEDED":
            errorMessage =
              "Rate limit exceeded. Please wait before trying again.";
            break;
          case "INVALID_TOKEN":
          case "CREDENTIAL_REQUIRED":
            errorMessage = "Invalid token. Please re-authenticate.";
            break;
          case "SUSPENDED":
            errorMessage = "Your account has been suspended.";
            break;
          case "BLOCKED":
            errorMessage = "You have been blocked from accessing this content.";
            break;
          default:
            errorMessage =
              misskeyError.message || `API Error: ${misskeyError.code}`;
        }
      }

      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isValidConfig, origin, token]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const retryFetch = () => {
    setError(null);
    setLists([]);
    fetchLists();
  };

  return { lists, error, isLoading, fetchLists, retryFetch };
}
