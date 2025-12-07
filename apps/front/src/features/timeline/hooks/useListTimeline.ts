import { Stream } from "misskey-js";
import { APIClient } from "misskey-js/api.js";
import { Note } from "misskey-js/entities.js";
import { useCallback, useEffect, useState } from "react";

export function useListTimeline(origin: string, token: string, listId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const isValidConfig =
    origin &&
    token &&
    listId &&
    origin.trim() !== "" &&
    token.trim() !== "" &&
    listId.trim() !== "";

  if (!isValidConfig && !error) {
    let errorMessage = "設定に問題があります: ";
    if (!origin || origin.trim() === "") {
      errorMessage += "サーバー情報が不足しています。";
    } else if (!token || token.trim() === "") {
      errorMessage += "認証情報が不足しています。";
    } else if (!listId || listId.trim() === "") {
      errorMessage += "リストIDが設定されていません。";
    }
    setError(new Error(errorMessage));
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
          listId,
          ...(untilId ? { untilId } : {}),
        };

        // biome-ignore lint/suspicious/noExplicitAny: Misskey API client type
        const res = await (client as any).request(
          "notes/user-list-timeline",
          params,
        );

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
        console.error("List timeline fetch error:", {
          origin,
          listId,
          error: err,
          untilId,
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
            errorMessage = "List not found or server unreachable.";
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
            case "NO_SUCH_LIST":
              errorMessage = "The specified list does not exist.";
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
    [isLoading, hasMore, isValidConfig, origin, token, listId],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchNotesを useeffectsにいれるといい感じに動かない
  useEffect(() => {
    fetchNotes();

    const stream = new Stream(origin, { token });
    // biome-ignore lint/correctness/useHookAtTopLevel: remove
    const channel = stream.useChannel("userList", { listId });

    channel.on("note", (note: Note) => {
      setNotes((prevNotes) => [note, ...prevNotes]);
    });

    stream.on("_disconnected_", () => {
      console.error("Stream disconnected from:", origin);
      setError(
        new Error(
          `Connection lost to ${origin}. Timeline updates may be delayed.`,
        ),
      );
    });

    stream.on("_connected_", () => {
      console.log("Stream connected to:", origin);
      setError(null);
    });

    return () => {
      channel.dispose();
      stream.close();
    };
  }, [origin, token, listId]);

  const retryFetch = () => {
    setError(null);
    setNotes([]);
    setHasMore(true);
    fetchNotes();
  };

  return { notes, error, hasMore, isLoading, fetchNotes, retryFetch };
}
