import { APIClient } from "misskey-js/api.js";
import { Note } from "misskey-js/entities.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { parseNotesResponse } from "../lib/noteResponseSchema";

export function useUserTimeline(origin: string, token: string, userId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const isValidConfig =
    origin &&
    token &&
    userId &&
    origin.trim() !== "" &&
    token.trim() !== "" &&
    userId.trim() !== "";

  const fetchNotes = useCallback(
    async (untilId?: string) => {
      if (isLoadingRef.current || !hasMoreRef.current || !isValidConfig) {
        return;
      }

      isLoadingRef.current = true;
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

        const validation = parseNotesResponse(res);
        if (!validation.success) {
          console.error("User timeline response validation error:", {
            issues: validation.issues,
          });
          setError(new Error("Invalid response format"));
          return;
        }

        const nextNotes = validation.output as Note[];
        if (nextNotes.length === 0) {
          hasMoreRef.current = false;
          setHasMore(false);
        } else {
          setNotes((prev) => (untilId ? [...prev, ...nextNotes] : nextNotes));
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
        isLoadingRef.current = false;
      }
    },
    [isValidConfig, origin, token, userId],
  );

  useEffect(() => {
    if (!isValidConfig) {
      return;
    }

    setNotes([]);
    setHasMore(true);
    hasMoreRef.current = true;
    void fetchNotes();

    // Note: Streaming for user timeline is more complex as it requires
    // listening to the main stream and filtering, or specific channel if available.
    // For now, we will just fetch initially.
    // Ideally, we should subscribe to the user's stream if possible.

    // Using main stream and filtering could be an option but might be heavy.
    // Let's stick to simple fetching for now.
  }, [fetchNotes, isValidConfig]);

  const retryFetch = () => {
    setError(null);
    setNotes([]);
    setHasMore(true);
    hasMoreRef.current = true;
    void fetchNotes();
  };

  return { notes, error, hasMore, isLoading, fetchNotes, retryFetch };
}
