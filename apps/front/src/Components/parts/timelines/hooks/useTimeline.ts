import { Stream } from "misskey-js";
import { APIClient } from "misskey-js/api.js";
import { Note } from "misskey-js/entities.js";
import { useEffect, useState } from "react";

type TimelineType = "home" | "local" | "global";
// Custom hook for timeline functionality
export function useTimeline(origin: string, token: string, type: TimelineType) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotes = async (untilId?: string) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const client = new APIClient({
        origin,
        credential: token,
      });

      const endpoint =
        type === "home" ? "notes/timeline" : `notes/${type}-timeline`;
      const params = untilId ? { untilId } : {};

      // biome-ignore lint/suspicious/noExplicitAny:
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
      console.error(err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    fetchNotes();

    // Setup WebSocket connection
    const stream = new Stream(origin, { token });
    const channel = stream.useChannel(`${type}Timeline`);

    // Handle new notes
    channel.on("note", (note: Note) => {
      setNotes((prevNotes) => [note, ...prevNotes]);
    });

    // Handle disconnection
    stream.on("_disconnected_", () => {
      console.error("Stream disconnected");
      setError(new Error("Connection lost"));
    });

    // Cleanup on unmount
    return () => {
      channel.dispose();
      stream.close();
    };
  }, [origin, token, type]);

  return { notes, error, hasMore, isLoading, fetchNotes };
}
