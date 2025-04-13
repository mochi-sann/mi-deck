import { $api } from "@/lib/api/fetchClient";
import { components } from "@/lib/api/type";
import { Fragment } from "react/jsx-runtime";
import Text from "../ui/text";
import { SwitchTimeLineType } from "./timelines/SwitchTimeLineType";

type TimelineEntityType =
  components["schemas"]["TimelineWithServerSessionEntity"];

export function TimelineList() {
  const { data: timelines, status } = $api.useQuery("get", "/v1/timeline", {});

  // Ensure timelines data structure matches expected type
  const typedTimelines = timelines as TimelineEntityType[] | undefined;

  return (
    <div className="flex h-screen overflow-x-auto overflow-y-hidden text-white">
      {status === "pending" && <Text>loading...</Text>}
      {status === "error" && (
        <Text color="red.500">Failed to load timelines.</Text>
      )}
      {status === "success" && (
        <Fragment>
          {typedTimelines && typedTimelines.length > 0 ? (
            typedTimelines.map((timeline) => (
              <div
                className="flex h-full w-80 flex-[0_0_320px] flex-col border-r border-r-[#38444d] border-solid text-white last:border-r-[none]"
                key={timeline.id}
              >
                <div className="shrink-0 border-b border-b-[#38444d] border-solid px-[15px] py-2.5">
                  <Text className="font-[bold] text-base">
                    {" "}
                    {/* Ensure variant prop is correctly passed */}
                    {timeline.name} ({timeline.type} @{" "}
                    {new URL(timeline.serverSession.origin).hostname})
                  </Text>
                </div>
                <div className="grow overflow-y-auto px-0 py-0">
                  <SwitchTimeLineType timeline={timeline} />
                </div>
              </div>
            ))
          ) : (
            <Text>No timelines created yet.</Text>
          )}
        </Fragment>
      )}
    </div>
  );
}
