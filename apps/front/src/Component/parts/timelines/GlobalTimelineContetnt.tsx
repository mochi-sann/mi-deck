import Text from "@/Component/ui/text";
import { useSuspenseQuery } from "@tanstack/react-query";
import { APIClient } from "misskey-js/api.js";
import { Note } from "misskey-js/entities.js";
import { TimelineNotes } from "./TimelineNotes";

// Component to fetch and display posts for a single timeline
export function GlobalTimelineContent({
  origin,
  token: serverToken,
  type,
}: {
  origin: string;
  token: string;
  type: string;
}) {
  // Define the query key
  const queryKey = ["timelineNotes", origin, type, serverToken]; // Include token in key if it can change

  const client = new APIClient({
    origin,
    credential: serverToken,
  });
  const {
    data: notes,
    error,
    isError,
  } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: async () => {
      try {
        const res = await client.request("notes/global-timeline", {});
        return res;
      } catch (err) {
        console.error(err);
        throw err; // Re-throw the error to be caught by React Query
      }
    },
  });

  // if (isLoading) {
  //   return <Spinner size="sm" label="Loading notes..." />;
  // }
  //
  if (isError) {
    return (
      <Text className="text-red-500">
        Error loading notes:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </Text>
    );
  }

  // Assuming the API returns an array of Note objects or similar structure
  const typedNotes = notes as Note[] | undefined;

  return <TimelineNotes notes={typedNotes} />;
}
