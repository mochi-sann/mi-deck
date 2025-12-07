import { useListTimeline } from "../hooks/useListTimeline";
import { VirtualTimeline } from "./VirtualTimeline";

export function ListTimelineContent({
  origin,
  token: serverToken,
  listId,
}: {
  origin: string;
  token: string;
  listId: string;
}) {
  const { notes, error, hasMore, isLoading, fetchNotes, retryFetch } =
    useListTimeline(origin, serverToken, listId);

  return (
    <VirtualTimeline
      origin={origin}
      notes={notes}
      isLoading={isLoading}
      hasMore={hasMore}
      error={error}
      fetchNotes={fetchNotes}
      retryFetch={retryFetch}
      emptyMessage="リストにノートがありません"
    />
  );
}
