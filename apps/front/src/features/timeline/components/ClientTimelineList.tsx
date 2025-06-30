import { ClientCreateTimelineDialog } from "@/components/parts/ClientCreateTimelineDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Text from "@/components/ui/text";
import { useStorage } from "@/lib/storage/context";
import type { TimelineConfig } from "@/lib/storage/types";
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
import { GripVertical, Plus, Server, Trash2 } from "lucide-react";
import { APIClient } from "misskey-js/api.js";
import { Fragment, Suspense, useState } from "react";
import {
  SwitchTimeLineType,
  SwitchTimeLineTypeProps,
} from "./SwitchTimeLineType";

function SortableTimeline({
  timeline,
  onDelete,
  isDeleting,
}: {
  timeline: TimelineConfig;
  onDelete: (timelineId: string) => void;
  isDeleting?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: timeline.id });

  const storage = useStorage();
  const server = storage.servers.find((s) => s.id === timeline.serverId);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!server) {
    return (
      <div ref={setNodeRef} style={style}>
        <Card className="flex h-full w-80 flex-[0_0_320px] flex-col gap-0 rounded-none">
          <CardContent className="flex h-full items-center justify-center">
            <Text>サーバーが見つかりません</Text>
          </CardContent>
        </Card>
      </div>
    );
  }

  const client = new APIClient({
    origin: server.origin,
    credential: server.accessToken || "",
  });

  const queryKey = ["meta", server.origin];
  const { data: serverInfo } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: async () => {
      return await client
        .request("meta", {
          detail: true,
        })
        .then((res) => res)
        .catch((err) => {
          console.error("Failed to fetch server meta:", err);
          return null;
        });
    },
  });

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

  // Convert our TimelineConfig to the format expected by SwitchTimeLineType
  const timelineForSwitch: SwitchTimeLineTypeProps["timeline"] = {
    id: timeline.id,
    name: timeline.name,
    type: timeline.type.toLowerCase() as
      | "home"
      | "local"
      | "global"
      | "list"
      | "list"
      | "channel",
    server: server,
    serverId: server.id,
    isVisible: timeline.isVisible,
    // serverSessionId: timeline.serverId,
    // serverSession: {
    //   id: server.id,
    //   origin: server.origin,
    //   serverToken: server.accessToken || "",
    //   serverType: "Misskey" as const,
    // },
    order: timeline.order,
    createdAt: timeline.createdAt,
    updatedAt: timeline.updatedAt,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="flex h-full w-80 flex-[0_0_320px] flex-col gap-0 rounded-none">
        <CardHeader className="flex shrink-0 items-center justify-between border-b pb-2">
          <CardTitle className="flex items-center gap-2 font-bold text-base">
            <Suspense
              fallback={
                <div className="size-8 rounded-md border bg-gray-200" />
              }
            >
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
            </Suspense>
            {server.serverInfo?.name && <span>{server.serverInfo.name}</span>}
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
          <SwitchTimeLineType timeline={timelineForSwitch} />
        </CardContent>
      </Card>
    </div>
  );
}

export function ClientTimelineList() {
  const storage = useStorage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const visibleTimelines = storage.timelines
    .filter((t) => t.isVisible)
    .sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = visibleTimelines.findIndex(
        (item) => item.id === active.id,
      );
      const newIndex = visibleTimelines.findIndex(
        (item) => item.id === over.id,
      );
      const newTimelines = arrayMove(visibleTimelines, oldIndex, newIndex);

      // Update order locally and persist
      const timelineIds = newTimelines.map((t) => t.id);
      try {
        await storage.reorderTimelines(timelineIds);
      } catch (error) {
        console.error("Failed to reorder timelines:", error);
        alert("タイムラインの並び替えに失敗しました。");
      }
    }
  };

  const handleDeleteTimeline = async (timelineId: string) => {
    setIsDeleting(true);
    try {
      await storage.deleteTimeline(timelineId);
    } catch (error) {
      console.error("Failed to delete timeline:", error);
      alert("タイムラインの削除に失敗しました。もう一度お試しください。");
    } finally {
      setIsDeleting(false);
    }
  };

  if (storage.isLoading) {
    return (
      <div className="flex h-screen overflow-x-auto overflow-y-hidden">
        <Card className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner />
            <Text>タイムラインを読み込み中...</Text>
            {storage.retryCount > 0 && (
              <Text className="text-muted-foreground text-sm">
                再試行中... ({storage.retryCount}/3)
              </Text>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Allow access without authentication - users can add servers as needed

  return (
    <div>
      <div className="flex h-screen overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Fragment>
            {visibleTimelines.length > 0 ? (
              <SortableContext
                items={visibleTimelines.map((t) => t.id)}
                strategy={horizontalListSortingStrategy}
              >
                {visibleTimelines.map((timeline) => (
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
                disabled={storage.servers.length === 0}
              >
                <Plus className="h-16 w-16 text-gray-400" />
                <Text className="mt-2 text-gray-500">
                  {storage.servers.length === 0
                    ? "まずサーバーを追加してください"
                    : "タイムラインを追加"}
                </Text>
              </Button>
            </Card>
            <ClientCreateTimelineDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              onSuccess={() => {
                setIsDialogOpen(false);
              }}
            />
          </Fragment>
        </DndContext>
      </div>
    </div>
  );
}
