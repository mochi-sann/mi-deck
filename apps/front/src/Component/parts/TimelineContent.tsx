import { Spinner } from "@/Component/ui/spinner";
import { Text } from "@/Component/ui/styled/text";
import { useSuspenseQuery } from "@tanstack/react-query";
import { APIClient } from "misskey-js/api.js";
import { Note } from "misskey-js/entities.js";
import { Suspense } from "react";
import { flex } from "styled-system/patterns";
import { MisskeyNote } from "./MisskeyNote"; // Import the extracted component

// Component to fetch and display posts for a single timeline
export function TimelineContent({
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
    // isLoading,
    isError,
    error,
  } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: async () => {
      return await client
        .request("notes/timeline", {})
        .then((res) => res)
        .catch((err) => {
          console.log(err);
        });
    },
  });

  // if (isLoading) {
  //   return <Spinner size="sm" label="Loading notes..." />;
  // }
  //
  if (isError) {
    return (
      <Text color="red.500">
        Error loading notes: {error && "Unknown error"}
      </Text>
    );
  }

  // Assuming the API returns an array of Note objects or similar structure
  const typedNotes = notes as Note[] | undefined;

  return (
    <Suspense fallback={<Spinner size="sm" label="Loading notes..." />}>
      <ul
        className={flex({
          flexDirection: "column",
          // Remove gap and padding from here, apply within MisskeyNote or its container
          padding: "0",
          listStyle: "none", // Ensure no list bullets
        })}
      >
        {typedNotes && typedNotes.length > 0 ? (
          // Render MisskeyNote directly, it's now an <article> but can be a child of <ul>
          typedNotes.map((note) => <MisskeyNote key={note.id} note={note} />)
        ) : (
          <Text size="sm">No notes found.</Text>
        )}
      </ul>
    </Suspense>
  );
}
