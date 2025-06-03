import Text from "@/Component/ui/text";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Stream } from "misskey-js";
import { APIClient } from "misskey-js/api.js";
import { Note } from "misskey-js/entities.js";
import { useEffect, useState } from "react";
import { TimelineNotes } from "./TimelineNotes";

type TimelineType = "home" | "local" | "global";

// Custom hook for timeline functionality
function useTimeline(origin: string, token: string, type: TimelineType) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [untilId, setUntilId] = useState<string | null>(null);

  const loadMore = async () => {
    if (!untilId) return;

    const client = new APIClient({
      origin,
      credential: token,
    });

    const endpoint =
      type === "home" ? "notes/timeline" : `notes/${type}-timeline`;
    try {
      // biome-ignore lint/suspicious/noExplicitAny:
      const res = await (client as any).request(endpoint, {
        untilId,
        limit: 20,
      });

      if (Array.isArray(res)) {
        const newNotes = res as Note[];
        if (newNotes.length > 0) {
          setNotes((prevNotes) => [...prevNotes, ...newNotes]);
          setUntilId(newNotes[newNotes.length - 1].id);
        }
      } else {
        setError(new Error("Invalid response format"));
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err : new Error("Failed to load more notes"),
      );
    }
  };

  useEffect(() => {
    const client = new APIClient({
      origin,
      credential: token,
    });

    // Initial fetch
    const endpoint =
      type === "home" ? "notes/timeline" : `notes/${type}-timeline`;
    // biome-ignore lint/suspicious/noExplicitAny:
    (client as any)
      .request(endpoint, { limit: 20 })
      .then((res: unknown) => {
        if (Array.isArray(res)) {
          const initialNotes = res as Note[];
          setNotes(initialNotes);
          if (initialNotes.length > 0) {
            setUntilId(initialNotes[initialNotes.length - 1].id);
          }
        } else {
          setError(new Error("Invalid response format"));
        }
      })
      .catch((err: Error) => {
        console.error(err);
        setError(err);
      });

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

  return { notes, error, loadMore, hasMore: !!untilId };
}

// Component to fetch and display posts for a single timeline
export function HomeTimelineContent({
  origin,
  token: serverToken,
  type,
}: {
  origin: string;
  token: string;
  type: TimelineType;
}) {
  const {
    notes,
    error: timelineError,
    loadMore,
    hasMore,
  } = useTimeline(origin, serverToken, type);

  const {
    status,
    data,
    error: queryError,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["timeline", origin, type],
    queryFn: async ({ pageParam = 0 }) => {
      if (pageParam > 0) {
        await loadMore();
      }
      return { nextOffset: pageParam + 1 };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
  });

  const error = timelineError || queryError;

  if (error) {
    return (
      <Text color="red.500">
        Error loading notes: {error.message || "Unknown error"}
      </Text>
    );
  }

  return (
    <TimelineNotes notes={notes} onLoadMore={loadMore} hasMore={hasMore} />
  );
}
