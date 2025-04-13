import { Card, CardContent, CardHeader } from "@/Component/ui/card";
import { $api } from "@/lib/api/fetchClient";
import { components } from "@/lib/api/type";
import { css } from "styled-system/css";
import Text from "../ui/text";
import { SwitchTimeLineType } from "./timelines/SwitchTimeLineType";

type TimelineEntityType =
  components["schemas"]["TimelineWithServerSessionEntity"];

export function TimelineList() {
  const { data: timelines, status } = $api.useQuery("get", "/v1/timeline", {});

  // Ensure timelines data structure matches expected type
  const typedTimelines = timelines as TimelineEntityType[] | undefined;

  return (
    <Card>
      <CardHeader>
        <Text variant={"h3"}>Your Timelines</Text>
      </CardHeader>
      <CardContent>
        {status === "pending" && <Text>loading...</Text>}
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
                <Card
                  key={timeline.id}
                  className={css({
                    width: "300px",
                    display: "flex",
                    flexShrink: 0,
                  })}
                >
                  <CardHeader>
                    <Text variant="h4">
                      {timeline.name} ({timeline.type} @{" "}
                      {new URL(timeline.serverSession.origin).hostname})
                    </Text>
                  </CardHeader>
                  <CardContent>
                    <SwitchTimeLineType timeline={timeline} />
                  </CardContent>
                </Card>
              ))
            ) : (
              <Text>No timelines created yet.</Text>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
