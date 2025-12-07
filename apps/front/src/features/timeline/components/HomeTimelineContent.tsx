import { useTimeline } from "../hooks/useTimeline";
import { VirtualTimeline } from "./VirtualTimeline";

type TimelineType = "home" | "local" | "global";

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
  const { notes, error, hasMore, isLoading, fetchNotes, retryFetch } =
    useTimeline(origin, serverToken, type);

  return (
    <VirtualTimeline
      origin={origin}
      notes={notes}
      isLoading={isLoading}
      hasMore={hasMore}
      error={error}
      fetchNotes={fetchNotes}
      retryFetch={retryFetch}
    />
  );
}
