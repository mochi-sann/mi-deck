import { $api } from "@/lib/api/fetchClient";
import { components } from "@/lib/api/type";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSuspenseQuery } from "@tanstack/react-query";
import { GripVertical, Plus, Server } from "lucide-react";
import { APIClient } from "misskey-js/api.js";
import { Fragment, Suspense, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Text from "../ui/text";
import { CreateTimelineDialog } from "./CreateTimelineDialog";
import { SwitchTimeLineType } from "./timelines/SwitchTimeLineType";

type TimelineEntityType =
  components["schemas"]["TimelineWithServerSessionEntity"];

function SortableTimeline({ timeline }: { timeline: TimelineEntityType }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: timeline.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const client = new APIClient({
    origin: timeline.serverSession.origin,
    credential: timeline.serverSession.serverToken,
  });
  const queryKey = ["meta", timeline.serverSession.origin];
  const { data: serverInfo } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: async () => {
      return await client
        .request("meta", {
          detail: true,
        })
        .then((res) => res)
        .catch((err) => {
          return err;
        });
    },
  });

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="flex h-full w-80 flex-[0_0_320px] flex-col gap-0 rounded-none">
        <CardHeader className="flex shrink-0 items-center justify-between border-b pb-2">
          <CardTitle className="flex items-center gap-2 font-bold text-base">
            <Suspense>
              {serverInfo.iconUrl ? (
                <img
                  src={serverInfo.iconUrl}
                  className="size-8 rounded-md border"
                  alt={serverInfo.name ?? ""}
                />
              ) : (
                <div className="flex size-8 content-center items-center justify-center rounded-md border">
                  <Server className="size-5" />
                </div>
              )}
            </Suspense>
            {serverInfo?.name && <span>{serverInfo.name}</span>}
            <span>({timeline.type})</span>
          </CardTitle>
          <div {...attributes} {...listeners} className="cursor-grab">
            <GripVertical />
          </div>
        </CardHeader>
        <CardContent className="grow overflow-y-auto p-0">
          <SwitchTimeLineType timeline={timeline} />
        </CardContent>
      </Card>
    </div>
  );
}

export function TimelineList() {
  const { data: timelines, status } = $api.useQuery("get", "/v1/timeline", {});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localTimelines, setLocalTimelines] = useState<TimelineEntityType[]>(
    [],
  );

  const { mutate } = $api.useMutation("patch", "/v1/timeline/order");

  useEffect(() => {
    if (timelines) {
      setLocalTimelines(timelines as TimelineEntityType[]);
    }
  }, [timelines]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    console.log(event.delta);

    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localTimelines.findIndex(
        (item) => item.id === active.id,
      );
      const newIndex = localTimelines.findIndex((item) => item.id === over.id);
      const newTimelines = arrayMove(localTimelines, oldIndex, newIndex);
      setLocalTimelines(newTimelines);
      // mutate(newTimelines.map((t) => t.id));
      mutate({
        body: {
          timelineIds: newTimelines.map((t) => t.id),
        },
      });
    }
  };

  return (
    <div>
      <div className="flex h-screen overflow-x-auto overflow-y-hidden">
        {status === "pending" && (
          <Card className="flex flex-1 items-center justify-center">
            <Text>読み込み中...</Text>
          </Card>
        )}
        {status === "error" && (
          <Card className="flex flex-1 items-center justify-center">
            <Text>タイムラインの読み込みに失敗しました。</Text>
          </Card>
        )}
        {status === "success" && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Fragment>
              {localTimelines.length > 0 ? (
                <SortableContext
                  items={localTimelines.map((t) => t.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {localTimelines.map((timeline) => (
                    <SortableTimeline key={timeline.id} timeline={timeline} />
                  ))}
                </SortableContext>
              ) : (
                <Card className="flex flex-1 items-center justify-center">
                  <Text>まだタイムラインが作成されていません。</Text>
                </Card>
              )}
              <Card className="flex h-full w-80 flex-[0_0_320px] flex-col items-center justify-center gap-0 rounded-none">
                <Button
                  variant="ghost"
                  className="flex h-full w-full flex-col items-center justify-center"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="h-16 w-16 text-gray-400" />
                  <Text className="mt-2 text-gray-500">タイムラインを追加</Text>
                </Button>
              </Card>
              <CreateTimelineDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSuccess={() => {
                  setIsDialogOpen(false);
                }}
              />
            </Fragment>
          </DndContext>
        )}
      </div>
    </div>
  );
}
