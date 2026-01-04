import { UserProfile } from "@/features/user/components/UserProfile";
import { useUserTimeline } from "../hooks/useUserTimeline";
import { VirtualTimeline } from "./VirtualTimeline";

export function UserTimelineContent({
  origin,
  token,
  userId,
}: {
  origin: string;
  token: string;
  userId: string;
}) {
  const { notes, error, hasMore, isLoading, fetchNotes, retryFetch } =
    useUserTimeline(origin, token, userId);

  return (
    <VirtualTimeline
      origin={origin}
      notes={notes}
      isLoading={isLoading}
      hasMore={hasMore}
      error={error}
      fetchNotes={fetchNotes}
      retryFetch={retryFetch}
      emptyMessage="ノートがありません"
      headerContent={
        <UserProfile userId={userId} origin={origin} token={token} />
      }
    />
  );
}
