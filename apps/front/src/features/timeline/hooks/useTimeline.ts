import { Stream } from "misskey-js";
import { APIClient } from "misskey-js/api.js";
import type { Note } from "misskey-js/entities.js";
import { useCallback, useEffect, useState } from "react";

type TimelineType = "home" | "local" | "global";
// Custom hook for timeline functionality
export function useTimeline(origin: string, token: string, type: TimelineType) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Validate origin and token
  const isValidConfig =
    origin && token && origin.trim() !== "" && token.trim() !== "";

  // If config is invalid, set error state
  if (!isValidConfig && !error) {
    setError(
      new Error(
        "サーバーまたは認証情報が設定されていません。サーバーを追加してください。",
      ),
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

        const endpoint =
          type === "home" ? "notes/timeline" : `notes/${type}-timeline`;
        const params = untilId ? { untilId } : {};

        // biome-ignore lint/suspicious/noExplicitAny: misskey-js client type flexibility
        const res = await (client as any).request(endpoint, params);

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
        console.error("Timeline fetch error:", {
          origin,
          type,
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
            errorMessage = "Timeline not found or server unreachable.";
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
    [isLoading, hasMore, isValidConfig, origin, token, type],
  );

  useEffect(() => {
    if (!isValidConfig) return;

    fetchNotes();

    // Setup WebSocket connection
    const stream = new Stream(origin, { token });

    // Handle stream errors
    stream.on("error", (error: unknown) => {
      console.error("Stream error:", error);
      setError(new Error("Stream connection error"));
    });

    // Connect to timeline channel
    const timelineChannel = `${type}Timeline`;
    stream.send("connect", {
      channel: timelineChannel,
      id: `timeline-${type}`,
    });

    // Handle new notes
    stream.on("note", (note: Note) => {
      setNotes((prevNotes) => [note, ...prevNotes]);
    });

    // Handle disconnection
    stream.on("_disconnected_", () => {
      console.error("Stream disconnected from:", origin);
      setError(
        new Error(
          `Connection lost to ${origin}. Timeline updates may be delayed.`,
        ),
      );
    });

    // Handle connection
    stream.on("_connected_", () => {
      console.log("Stream connected to:", origin);
      setError(null);
    });

    // Cleanup on unmount
    return () => {
      stream.close();
    };
  }, [origin, token, type, fetchNotes, isValidConfig]);

  const retryFetch = () => {
    setError(null);
    setNotes([]);
    setHasMore(true);
    fetchNotes();
  };

  return { notes, error, hasMore, isLoading, fetchNotes, retryFetch };
}
