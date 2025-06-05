import { $api } from "@/lib/api/fetchClient";
import { components } from "@/lib/api/type";
import { Fragment } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Text from "../ui/text";
import { SwitchTimeLineType } from "./timelines/SwitchTimeLineType";
import { Button } from "../ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { CreateTimelineDialog } from "./CreateTimelineDialog";
import { useState } from "react";

type TimelineEntityType =
  components["schemas"]["TimelineWithServerSessionEntity"];

export function TimelineList() {
  const { data: timelines, status } = $api.useQuery("get", "/v1/timeline", {});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Ensure timelines data structure matches expected type
  const typedTimelines = timelines as TimelineEntityType[] | undefined;

  return (
    <div className="flex h-screen overflow-x-auto overflow-y-hidden">
      {" "}
      {/* paddingを削除 */}
      {status === "pending" && (
        <Card className="flex flex-1 items-center justify-center">
          {" "}
          {/* Cardで囲む */}
          <Text>読み込み中...</Text>
        </Card>
      )}
      {status === "error" && (
        <Card className="flex flex-1 items-center justify-center">
          {" "}
          {/* Cardで囲む */}
          <Text>タイムラインの読み込みに失敗しました。</Text>
        </Card>
      )}
      {status === "success" && (
        <Fragment>
          {typedTimelines && typedTimelines.length > 0 ? (
            typedTimelines.map((timeline) => (
              <Card
                className="flex h-full w-80 flex-[0_0_320px] flex-col gap-0 rounded-none" // margin-rightを削除
                key={timeline.id}
              >
                <CardHeader className="shrink-0 border-b pb-2">
                  {" "}
                  {/* shadcn/uiのCardHeaderを使用 */}
                  <CardTitle className="font-bold text-base">
                    {" "}
                    {/* shadcn/uiのCardTitleを使用 */}
                    {timeline.name} ({timeline.type} @
                    {new URL(timeline.serverSession.origin).hostname})
                  </CardTitle>
                </CardHeader>
                <CardContent className="grow overflow-y-auto p-0">
                  <SwitchTimeLineType timeline={timeline} />
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="flex flex-1 items-center justify-center">
              {" "}
              {/* Cardで囲む */}
              <Text>まだタイムラインが作成されていません。</Text>
            </Card>
          )}
          <Card className="flex h-full w-80 flex-[0_0_320px] flex-col items-center justify-center gap-0 rounded-none">
            <Button
              variant="ghost"
              className="flex h-full w-full flex-col items-center justify-center"
              onClick={() => setIsDialogOpen(true)}
            >
              <PlusCircledIcon className="h-16 w-16 text-gray-400" />
              <Text className="mt-2 text-gray-500">タイムラインを追加</Text>
            </Button>
          </Card>
          <CreateTimelineDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSuccess={() => {
              $api.invalidateQueries("get", "/v1/timeline");
              setIsDialogOpen(false);
            }}
          />
        </Fragment>
      )}
    </div>
  );
}
