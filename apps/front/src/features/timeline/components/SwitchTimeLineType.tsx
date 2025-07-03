import type React from "react";
import type {
  MisskeyServerConnection,
  TimelineConfig,
} from "@/lib/storage/types";
import { HomeTimelineContent } from "./HomeTimelineContent";

export type SwitchTimeLineTypeProps = {
  timeline: TimelineConfig & { server: MisskeyServerConnection };
};

export const SwitchTimeLineType: React.FC<SwitchTimeLineTypeProps> = (
  props,
) => {
  const { timeline } = props;

  switch (timeline.type) {
    case "home":
      return (
        <HomeTimelineContent
          origin={timeline.server.origin}
          token={timeline.server.accessToken ?? ""}
          type={"home"}
        />
      );

    case "local":
      return (
        <HomeTimelineContent
          origin={timeline.server.origin}
          token={timeline.server.accessToken ?? ""}
          type={"local"}
        />
      );

    case "social":
      return (
        <HomeTimelineContent
          origin={timeline.server.origin}
          token={timeline.server.accessToken ?? ""}
          type={"local"}
        />
      );

    case "global":
      return (
        <HomeTimelineContent
          origin={timeline.server.origin}
          token={timeline.server.accessToken ?? ""}
          type={"global"}
        />
      );
    default:
      return (
        <div>
          <p>No matching timeline type: {timeline.type}</p>
        </div>
      );
  }
};
