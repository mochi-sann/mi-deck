import { useVirtualizer } from "@tanstack/react-virtual";
import { type Note } from "misskey-js/entities.js";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Text from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { MisskeyNote } from "./MisskeyNote";

type VirtualTimelineProps = {
  origin: string;
  notes: Note[];
  isLoading: boolean;
  hasMore: boolean;
  error: Error | null;
  fetchNotes: (untilId?: string) => void;
  retryFetch: () => void;
  emptyMessage?: string;
};

const isNoteRecent = (note: Note) => {
  const created = new Date(note.createdAt).getTime();
  const now = Date.now();
  // Animate if created within the last 15 seconds
  return now - created < 15000;
};

export function VirtualTimeline({
  origin,
  notes,
  isLoading,
  hasMore,
  error,
  fetchNotes,
  retryFetch,
  emptyMessage = "No notes found",
}: VirtualTimelineProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: notes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
    measureElement: (element) => {
      return element.getBoundingClientRect().height;
    },
    getItemKey: (index) => notes[index]?.id || index,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();
    if (!lastItem) return;

    // Trigger fetch when we are near the bottom (within 3 items)
    if (lastItem.index >= notes.length - 3 && hasMore && !isLoading) {
      fetchNotes(notes[notes.length - 1]?.id);
    }
  }, [hasMore, isLoading, notes, fetchNotes, virtualItems]);

  if (!isLoading && notes.length === 0) {
    if (error) {
      return (
        <div className="flex flex-col items-center gap-4 p-4">
          <Text className="text-center text-red-500">
            Error loading notes: {error.message || "Unknown error"}
          </Text>
          <Button onClick={retryFetch} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      );
    }

    return (
      <div className="p-4 text-center">
        <Text>{emptyMessage}</Text>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-full overflow-y-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const note = notes[virtualRow.index];
          if (!note) return null;

          const isRecent = isNoteRecent(note);

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className={cn(
                "absolute top-0 left-0 w-full",
                isRecent &&
                  "fade-in slide-in-from-top-8 animate-in duration-500",
              )}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <MisskeyNote origin={origin} note={note} />
            </div>
          );
        })}
      </div>
      {isLoading && (
        <div style={{ textAlign: "center", padding: "1rem" }}>
          <Text>
            <Spinner />
          </Text>
        </div>
      )}
      {error && notes.length > 0 && (
        <div className="flex flex-col items-center gap-2 p-4">
          <Text className="text-center text-red-500">
            Error loading more notes: {error?.message || "Unknown error"}
          </Text>
          <Button onClick={retryFetch} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
