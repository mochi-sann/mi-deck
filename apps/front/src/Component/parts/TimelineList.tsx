import { Card } from "@/Component/ui/card";
import { Spinner } from "@/Component/ui/spinner";
import { Heading } from "@/Component/ui/styled/heading";
import { Text } from "@/Component/ui/styled/text";
import { $api } from "@/lib/api/fetchClient";
import { components } from "@/lib/api/type";
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { APIClient } from "misskey-js/api.js";
import { css } from "styled-system/css";

type TimelineEntityType =
  components["schemas"]["TimelineWithServerSessionEntity"];

// Map timeline types from backend to misskey-js API endpoints
const timelineTypeToEndpoint = (
  type: string,
): "notes/timeline" | "notes/local-timeline" => {
  switch (type.toLowerCase()) {
    case "home":
      return "notes/timeline";
    case "local":
      return "notes/local-timeline";
    // case "social": // Assuming 'social' maps to hybrid
    //   return "notes/hybrid-timeline";
    // case "global":
    // return "notes/global-timeline";
    default:
      console.warn(`Unknown timeline type: ${type}, falling back to home.`);
      return "notes/timeline"; // Fallback or throw error
  }
};

// Component to fetch and display posts for a single timeline
function TimelineContent({
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
  const endpoints = timelineTypeToEndpoint(type);
  const {
    data: notes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["timeline"],
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

  return (
    <ul>
      {notes && notes.length > 0 ? (
        notes.map((note) => (
          <li key={note.id} className="mb-1 p-1 border-b">
            <Text fontSize="xs">{note.text || <i>(No Text)</i>}</Text>
            <Text fontSize="2xs" color="gray.500" textAlign="right">
              @{note.user.username}
            </Text>
          </li>
        ))
      ) : (
        <Text size="sm">No notes found.</Text>
      )}
    </ul>
  );
}

export function TimelineList() {
  const { data: timelines, status } = $api.useQuery("get", "/v1/timeline", {});

  // Ensure timelines data structure matches expected type
  const typedTimelines = timelines as TimelineEntityType[] | undefined;

  return (
    <Card.Root mt="6">
      <Card.Header>
        <Heading as="h3" size="md">
          Your Timelines
        </Heading>
      </Card.Header>
      <Card.Body>
        {status === "pending" && <Spinner label="Loading timelines..." />}
        {status === "error" && (
          <Text color="red.500">Failed to load timelines.</Text>
        )}
        {status === "success" && (
          <div
            className={css({
              display: "grid",
              gap: "4",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", // Responsive grid
            })}
          >
            {typedTimelines && typedTimelines.length > 0 ? (
              typedTimelines.map((timeline) => (
                <Card.Root key={timeline.id}>
                  <Card.Header>
                    <Heading as="h4" size="sm">
                      {timeline.name} ({timeline.type} @{" "}
                      {new URL(timeline.serverSession.origin).hostname})
                    </Heading>
                    <pre>token :{timeline.serverSession.serverToken}</pre>
                  </Card.Header>
                  <Card.Body>
                    {JSON.stringify(timeline, null, 2)}
                    <TimelineContent
                      origin={timeline.serverSession.origin}
                      // IMPORTANT: Ensure serverToken is actually available here!
                      // If not, the backend response needs to include it.
                      token={
                        timeline.serverSession.serverToken ?? "" // Assuming serverToken exists, add proper typing if possible
                      }
                      type={timeline.type}
                    />
                  </Card.Body>
                </Card.Root>
              ))
            ) : (
              <Text>No timelines created yet.</Text>
            )}
          </div>
        )}
      </Card.Body>
    </Card.Root>
  );
}
