import Text from "@/Component/ui/text";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Stream } from "misskey-js";
import { APIClient } from "misskey-js/api.js";
import { Note } from "misskey-js/entities.js";
import { useEffect, useRef, useState } from "react";
import { MisskeyNote } from "../MisskeyNote";

type TimelineType = "home" | "local" | "global";

// Custom hook for timeline functionality
function useTimeline(origin: string, token: string, type: TimelineType) {
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
  const { notes, error, hasMore, isLoading, fetchNotes } = useTimeline(
    origin,
    serverToken,
    type,
  );
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: notes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // 各ノートの推定高さ
    overscan: 5, // スクロール時に先読みするアイテム数
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) return;

    if (
      lastItem.index >= notes.length - 1 &&
      hasMore &&
      !isLoading &&
      lastItem.end >= lastItem.size
    ) {
      fetchNotes(notes[notes.length - 1]?.id);
    }
  }, [rowVirtualizer.getVirtualItems(), hasMore, isLoading, notes]);

  if (error) {
    return (
      <Text color="red.500">
        Error loading notes: {error.message || "Unknown error"}
      </Text>
    );
  }

  return (
    <div
      ref={parentRef}
      style={{
        height: "100%",
        overflow: "auto",
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <MisskeyNote note={notes[virtualRow.index]} />
          </div>
        ))}
      </div>
      {isLoading && (
        <div style={{ textAlign: "center", padding: "1rem" }}>
          <Text>Loading...</Text>
        </div>
      )}
    </div>
  );
}
