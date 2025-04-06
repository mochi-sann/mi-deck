import { Card } from "@/Component/ui/card";
import { Spinner } from "@/Component/ui/spinner";
import { Heading } from "@/Component/ui/styled/heading";
import { Text } from "@/Component/ui/styled/text";
import { $api } from "@/lib/api/fetchClient";
import { components } from "@/lib/api/type";
import { css } from "styled-system/css";
import { TimelineContent } from "./TimelineContent"; // Import the new component

type TimelineEntityType =
  components["schemas"]["TimelineWithServerSessionEntity"];

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
