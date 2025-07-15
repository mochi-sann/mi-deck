import { APIClient } from "misskey-js/api.js";
import { Note } from "misskey-js/entities.js";
import { useCallback, useEffect, useState } from "react";

// Custom hook for user timeline functionality
export function useUserTimeline(origin: string, token: string, userId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Validate origin, token, and userId
  const isValidConfig =
    origin &&
    token &&
    userId &&
    origin.trim() !== "" &&
    token.trim() !== "" &&
    userId.trim() !== "";

  // If config is invalid, set error state
  if (!isValidConfig && !error) {
    setError(
      new Error("サーバー、認証情報、またはユーザーIDが設定されていません。"),
    );
  }

  const fetchNotes = useCallback(
    async (untilId?: string) => {
      if (isLoading || !hasMore || !isValidConfig) return;

      setIsLoading(true);
      try {
        const client = new APIClient({
          origin,
          credential: token,
        });

        const params = {
          userId,
          ...(untilId && { untilId }),
          limit: 20, // Default limit for user notes
        };

        // biome-ignore lint/suspicious/noExplicitAny: UserNotes response type
        const res = await (client as any).request("users/notes", params);

        if (Array.isArray(res)) {
          if (res.length === 0) {
            setHasMore(false);
          } else {
            setNotes((prev) => (untilId ? [...prev, ...res] : res));
          }
        } else {
          setError(new Error("Invalid response format"));
        }
      } catch (err) {
        console.error("User timeline fetch error:", {
          origin,
          userId,
          error: err,
          untilId,
        });

        let errorMessage = "Unknown error occurred";

        if (err instanceof Error) {
          // Handle network errors
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
            errorMessage = "User not found or timeline unreachable.";
          } else if (err.message.includes("500")) {
            errorMessage = "Server error. Please try again later.";
          } else {
            errorMessage = err.message;
          }
        } else if (typeof err === "object" && err !== null && "code" in err) {
          // Handle Misskey API specific errors
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
              errorMessage =
                "You have been blocked from accessing this content.";
              break;
            case "NO_SUCH_USER":
              errorMessage = "User not found.";
              break;
            case "FORBIDDEN":
              errorMessage =
                "You don't have permission to view this user's notes.";
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
    },
    [origin, token, userId, isLoading, hasMore, isValidConfig],
  );

  // Load user timeline when parameters change
  useEffect(() => {
    if (isValidConfig) {
      setNotes([]);
      setError(null);
      setHasMore(true);
      fetchNotes();
    }
  }, [isValidConfig, fetchNotes]);

  const retryFetch = () => {
    setError(null);
    setNotes([]);
    setHasMore(true);
    fetchNotes();
  };

  const loadMore = () => {
    if (notes.length > 0 && hasMore && !isLoading) {
      const lastNote = notes[notes.length - 1];
      fetchNotes(lastNote.id);
    }
  };

  return {
    notes,
    error,
    hasMore,
    isLoading,
    fetchNotes,
    retryFetch,
    loadMore,
  };
}
