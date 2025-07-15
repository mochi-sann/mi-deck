import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Text from "@/components/ui/text";
import { useUserTimeline } from "../hooks/useUserTimeline";
import { MisskeyNote } from "./MisskeyNote";

// Component to fetch and display posts for a user timeline
export function UserTimelineContent({
  origin,
  token: serverToken,
  userId,
}: {
  origin: string;
  token: string;
  userId: string;
}) {
  const { notes, error, hasMore, isLoading, loadMore, retryFetch } =
    useUserTimeline(origin, serverToken, userId);
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: notes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // 初期推定値
    overscan: 5,
    measureElement: (element) => {
      // 要素の実際の高さを取得
      return element.getBoundingClientRect().height;
    },
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) return;

    if (
      lastItem.index >= notes.length - 1 &&
      hasMore &&
      !isLoading &&
      lastItem.end >= lastItem.size
    ) {
      loadMore();
    }
  }, [hasMore, isLoading, notes, loadMore, rowVirtualizer]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <Text className="text-center text-red-500">
          Error loading user notes: {error.message || "Unknown error"}
        </Text>
        <Button onClick={retryFetch} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  if (!isLoading && notes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <Text className="text-center text-muted-foreground">
          このユーザーの投稿は見つかりませんでした。
        </Text>
      </div>
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
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <MisskeyNote origin={origin} note={notes[virtualRow.index]} />
          </div>
        ))}
      </div>
      {isLoading && (
        <div style={{ textAlign: "center", padding: "1rem" }}>
          <Text>
            <Spinner />
          </Text>
        </div>
      )}
    </div>
  );
}
