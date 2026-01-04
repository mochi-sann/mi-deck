import { APIClient } from "misskey-js/api.js";
import { Note } from "misskey-js/entities.js";
import { useCallback, useEffect, useState } from "react";

export function useUserTimeline(origin: string, token: string, userId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const isValidConfig =
    origin &&
    token &&
    userId &&
    origin.trim() !== "" &&
    token.trim() !== "" &&
    userId.trim() !== "";

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
          limit: 10,
          ...(untilId ? { untilId } : {}),
        };

        const res = await client.request("users/notes", params);

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
        console.error("User timeline fetch error:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch user timeline"),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, hasMore, isValidConfig, origin, token, userId],
  );

  useEffect(() => {
    setNotes([]);
    setHasMore(true);
    fetchNotes(); // oxlint-disable-line

    // Note: Streaming for user timeline is more complex as it requires
    // listening to the main stream and filtering, or specific channel if available.
    // For now, we will just fetch initially.
    // Ideally, we should subscribe to the user's stream if possible.

    // Using main stream and filtering could be an option but might be heavy.
    // Let's stick to simple fetching for now.
  }, [origin, token, userId]);

  const retryFetch = () => {
    setError(null);
    setNotes([]);
    setHasMore(true);
    fetchNotes();
  };

  return { notes, error, hasMore, isLoading, fetchNotes, retryFetch };
}
