import { components } from "@/lib/api/type";
import type React from "react";
import { GlobalTimelineContent } from "./GlobalTimelineContetnt";
import { HomeTimelineContent } from "./HomeTimelineContent";
import { LocalTimelineContent } from "./LocalTimelineContetnt";

export type SwitchTimeLineTypeProps = {
  timeline: components["schemas"]["TimelineWithServerSessionEntity"];
};

export const SwitchTimeLineType: React.FC<SwitchTimeLineTypeProps> = (
  props,
) => {
  switch (props.timeline.type) {
    case "HOME":
      return (
        <HomeTimelineContent
          origin={props.timeline.serverSession.origin}
          // IMPORTANT: Ensure serverToken is actually available here!
          // If not, the backend response needs to include it.
          token={
            props.timeline.serverSession.serverToken ?? "" // Assuming serverToken exists, add proper typing if possible
          }
          type={props.timeline.type}
        />
      );

    case "LOCAL":
      return (
        <LocalTimelineContent
          origin={props.timeline.serverSession.origin}
          // IMPORTANT: Ensure serverToken is actually available here!
          // If not, the backend response needs to include it.
          token={
            props.timeline.serverSession.serverToken ?? "" // Assuming serverToken exists, add proper typing if possible
          }
          type={props.timeline.type}
        />
      );

    case "GLOBAL":
      return (
        <GlobalTimelineContent
          origin={props.timeline.serverSession.origin}
          // IMPORTANT: Ensure serverToken is actually available here!
          // If not, the backend response needs to include it.
          token={
            props.timeline.serverSession.serverToken ?? "" // Assuming serverToken exists, add proper typing if possible
          }
          type={props.timeline.type}
        />
      );
    // case "LIST":
    // case "USER":
    // case "CHANNEL":
    default:
      <div>
        <p>not matchd timelint type</p>
      </div>;
  }
  return (
    <div>
      {" "}
      <p>not matchd timelint type</p>
    </div>
  );
};
