import { Card } from "@/Component/ui/card";
import { Spinner } from "@/Component/ui/spinner";
import { Heading } from "@/Component/ui/styled/heading";
import { Text } from "@/Component/ui/styled/text";
import { $api } from "@/lib/api/fetchClient";
import { components } from "@/lib/api/type";
import { css } from "styled-system/css";
import { SwitchTimeLineType } from "./timelines/SwitchTimeLineType";

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
              display: "flex",
              flex: "1",
              overflowX: "auto",
              overflowY: "scroll",
              overscrollBehavior: "contain",
              p: "4",
              gap: "4",
              // gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", // Responsive grid
            })}
          >
            {typedTimelines && typedTimelines.length > 0 ? (
              typedTimelines.map((timeline) => (
                <Card.Root
                  key={timeline.id}
                  className={css({
                    width: "300px",
                    display: "flex",
                    flexShrink: 0,
                  })}
                >
                  <Card.Header>
                    <Heading as="h4" size="sm">
                      {timeline.name} ({timeline.type} @{" "}
                      {new URL(timeline.serverSession.origin).hostname})
                    </Heading>
                  </Card.Header>
                  <Card.Body>
                    <SwitchTimeLineType timeline={timeline} />
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
