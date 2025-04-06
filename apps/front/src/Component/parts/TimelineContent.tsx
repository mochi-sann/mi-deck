import { Spinner } from "@/Component/ui/spinner";
import { Text } from "@/Component/ui/styled/text";
import { useQuery } from "@tanstack/react-query";
import { APIClient, Note } from "misskey-js"; // Import Note type
import { css } from "styled-system/css";
import { Flex } from "styled-system/jsx";

// Component to display a single Misskey note
function MisskeyNote({ note }: { note: Note }) {
  return (
    <li
      key={note.id}
      className={css({
        p: "2",
        border: "solid 1px",
        borderRadius: "md",
        borderColor: "gray.300", // Added border color for better visibility
        listStyle: "none", // Remove default list styling
      })}
    >
      <Text fontSize="xs">{note.text || <i>(No Text)</i>}</Text>
      <Text fontSize="2xs" color="gray.500" textAlign="right">
        @{note.user.username}
      </Text>
    </li>
  );
}

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

  // Define the query function
  // const fetchNotes = async (): Promise<Note[]> => {
  //   const endpoint = timelineTypeToEndpoint(type);
  //   // Fetch last 10 notes for simplicity
  //   const fetchedNotes = await client.request(endpoint, { limit: 10 });
  //   return fetchedNotes;
  // };
  const client = new APIClient({
    origin,
    credential: serverToken,
  });
  const {
    data: notes,
    isLoading,
    isError,
    error,
  } = useQuery({
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

  // Use the useQuery hook
  // const {
  //   data: notes,
  //   isLoading,
  //   isError,
  //   error,
  // } = useQuery<Note[], Error>({
  //   queryKey: queryKey,
  //   queryFn: fetchNotes,
  //   // Optional: Configure staleTime, cacheTime, refetch options etc.
  //   // staleTime: 5 * 60 * 1000, // 5 minutes
  // });

  if (isLoading) {
    return <Spinner size="sm" label="Loading notes..." />;
  }

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
    <Flex
      as="ul" // Use ul for semantic list structure
      className={css({ flexDirection: "column", gap: "2", padding: "0" })} // Reset padding
    >
      {typedNotes && typedNotes.length > 0 ? (
        typedNotes.map((note) => <MisskeyNote key={note.id} note={note} />)
      ) : (
        <Text size="sm">No notes found.</Text>
      )}
    </Flex>
  );
}
