import { Card, CardContent, CardHeader } from "@/Component/ui/card";
import { $api } from "@/lib/api/fetchClient";
import { components } from "@/lib/api/type";
import { cn } from "@/lib/utils"; // Import cn utility
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
            className={cn(
              "flex flex-1 gap-4 overflow-x-auto overflow-y-scroll overscroll-contain p-4", // Translated styles
              // "grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))]", // Alternative: Responsive grid
            )}
          >
            {typedTimelines && typedTimelines.length > 0 ? (
              typedTimelines.map((timeline) => (
                <Card
                  key={timeline.id}
                  className={cn(
                    "flex w-[300px] shrink-0", // Translated styles
                  )}
                >
                  <CardHeader>
                    <Text variant={"h4"}> {/* Ensure variant prop is correctly passed */}
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
