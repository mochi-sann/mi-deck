import { useStorage } from "@/lib/storage/context";
import type {
  MisskeyServerConnection,
  TimelineConfig,
} from "@/lib/storage/types";
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
import { GripVertical, Plus, Server, Trash2 } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Text from "../ui/text";
import { CreateTimelineDialog } from "./CreateTimelineDialog";
import { SwitchTimeLineType } from "./timelines/SwitchTimeLineType";

type TimelineEntityType = TimelineConfig & {
  server: MisskeyServerConnection;
};

function SortableTimeline({
  timeline,
  onDelete,
  isDeleting,
}: {
  timeline: TimelineEntityType;
  onDelete: (timelineId: string) => void;
  isDeleting?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: timeline.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const serverInfo = timeline.server.serverInfo;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(
        `タイムライン「${timeline.name}」を削除しますか？この操作は取り消せません。`,
      )
    ) {
      onDelete(timeline.id);
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="flex h-full w-80 flex-[0_0_320px] flex-col gap-0 rounded-none">
        <CardHeader className="flex shrink-0 items-center justify-between border-b pb-2">
          <CardTitle className="flex items-center gap-2 font-bold text-base">
            {serverInfo?.iconUrl ? (
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
            {serverInfo?.name && <span>{serverInfo.name}</span>}
            <span>({timeline.type})</span>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
              title="タイムラインを削除"
              disabled={isDeleting}
            >
              <Trash2
                className={`h-4 w-4 ${isDeleting ? "animate-pulse" : ""}`}
              />
            </Button>
            <div {...attributes} {...listeners} className="cursor-grab">
              <GripVertical />
            </div>
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
  const {
    timelines,
    servers,
    deleteTimeline,
    reorderTimelines,
    isLoading,
    error,
  } = useStorage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create enhanced timeline objects with server data
  const enhancedTimelines: TimelineEntityType[] = timelines
    .map((timeline) => {
      const server = servers.find((s) => s.id === timeline.serverId);
      return {
        ...timeline,
        server: server!,
      };
    })
    .filter((timeline) => timeline.server); // Filter out timelines without servers

  const [localTimelines, setLocalTimelines] =
    useState<TimelineEntityType[]>(enhancedTimelines);

  useEffect(() => {
    setLocalTimelines(enhancedTimelines);
  }, [enhancedTimelines]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localTimelines.findIndex(
        (item) => item.id === active.id,
      );
      const newIndex = localTimelines.findIndex((item) => item.id === over.id);
      const newTimelines = arrayMove(localTimelines, oldIndex, newIndex);
      setLocalTimelines(newTimelines);

      try {
        await reorderTimelines(newTimelines.map((t) => t.id));
      } catch (error) {
        console.error("Failed to reorder timelines:", error);
        // Revert local state on error
        setLocalTimelines(localTimelines);
      }
    }
  };

  const handleDeleteTimeline = async (timelineId: string) => {
    setIsDeleting(true);
    try {
      await deleteTimeline(timelineId);
      // Remove from local state immediately for better UX
      setLocalTimelines((prev) => prev.filter((t) => t.id !== timelineId));
    } catch (error) {
      console.error("Failed to delete timeline:", error);
      alert("タイムラインの削除に失敗しました。もう一度お試しください。");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex h-screen overflow-x-auto overflow-y-hidden">
        {isLoading && (
          <Card className="flex flex-1 items-center justify-center">
            <Text>読み込み中...</Text>
          </Card>
        )}
        {error && (
          <Card className="flex flex-1 items-center justify-center">
            <Text>タイムラインの読み込みに失敗しました。</Text>
          </Card>
        )}
        {!isLoading && !error && (
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
                    <SortableTimeline
                      key={timeline.id}
                      timeline={timeline}
                      onDelete={handleDeleteTimeline}
                      isDeleting={isDeleting}
                    />
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
