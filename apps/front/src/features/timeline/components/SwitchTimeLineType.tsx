import type React from "react";
import type {
  MisskeyServerConnection,
  TimelineConfig,
} from "@/lib/storage/types";
import { HomeTimelineContent } from "./HomeTimelineContent";
import { ListTimelineContent } from "./ListTimelineContent";

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

    case "list":
      if (!timeline.settings?.listId) {
        return (
          <div className="flex flex-col items-center gap-4 p-4">
            <p className="text-center text-red-500">
              リストIDが設定されていません。タイムラインを再作成してください。
            </p>
          </div>
        );
      }

      return (
        <ListTimelineContent
          origin={timeline.server.origin}
          token={timeline.server.accessToken ?? ""}
          listId={timeline.settings.listId}
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
