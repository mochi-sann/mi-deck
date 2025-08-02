import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSuspenseQuery } from "@tanstack/react-query";
import { GripVertical, Plus, Server, Trash2 } from "lucide-react";
import { APIClient } from "misskey-js/api.js";
import { ServerInfoResponse } from "misskey-js/entities.js";
import { Fragment, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { ClientCreateTimelineDialog } from "@/components/parts/ClientCreateTimelineDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Text from "@/components/ui/text";
import type { TimelineConfig } from "@/lib/storage/types";
import {
  SwitchTimeLineType,
  type SwitchTimeLineTypeProps,
} from "./SwitchTimeLineType";

interface SortableTimelineProps {
  timeline: TimelineConfig;
  server: ServerInfo;
  onDelete: (timelineId: string) => void;
  isDeleting?: boolean;
}

function SortableTimeline({
  timeline,
  server,
  onDelete,
  isDeleting,
}: SortableTimelineProps) {
  const { t } = useTranslation("timeline");
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: timeline.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
    if (window.confirm(t("list.deleteConfirm", { name: timeline.name }))) {
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
      | "channel",
    server: server,
    serverId: server.id,
    isVisible: timeline.isVisible,
    order: timeline.order,
    createdAt: timeline.createdAt,
    updatedAt: timeline.updatedAt,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="flex h-full w-80 flex-[0_0_320px] flex-col gap-0 rounded-none pt-6 pb-0">
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
              title={t("list.deleteTimeline")}
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

function MissingServerTimeline({ timeline }: { timeline: TimelineConfig }) {
  const { t } = useTranslation("timeline");
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: timeline.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="flex h-full w-80 flex-[0_0_320px] flex-col gap-0 rounded-none">
        <CardContent className="flex h-full items-center justify-center">
          <Text>{t("list.serverNotFound")}</Text>
        </CardContent>
      </Card>
    </div>
  );
}

export interface ClientTimelineListPresenterProps {
  timelines: TimelineConfig[];
  servers: ServerInfoResponse[];
  isLoading: boolean;
  retryCount: number;
  isDeleting: boolean;
  isDialogOpen: boolean;
  onDragEnd: (event: DragEndEvent) => void;
  onDeleteTimeline: (timelineId: string) => void;
  onOpenDialog: () => void;
  onCloseDialog: () => void;
  onDialogSuccess: () => void;
}

export function ClientTimelineListPresenter({
  timelines,
  servers,
  isLoading,
  retryCount,
  isDeleting,
  isDialogOpen,
  onDragEnd,
  onDeleteTimeline,
  onOpenDialog,
  onCloseDialog,
  onDialogSuccess,
}: ClientTimelineListPresenterProps) {
  const { t } = useTranslation("timeline");

  const visibleTimelines = timelines
    .filter((t) => t.isVisible)
    .sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-x-auto overflow-y-hidden">
        <Card className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner />
            <Text>{t("list.loading")}</Text>
            {retryCount > 0 && (
              <Text className="text-muted-foreground text-sm">
                {t("list.retrying", { count: retryCount })}
              </Text>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-screen overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <Fragment>
            {visibleTimelines.length > 0 ? (
              <SortableContext
                items={visibleTimelines.map((t) => t.id)}
                strategy={horizontalListSortingStrategy}
              >
                {visibleTimelines.map((timeline) => {
                  const server = servers.find(
                    (s) => s.id === timeline.serverId,
                  );

                  if (!server) {
                    return (
                      <MissingServerTimeline
                        key={timeline.id}
                        timeline={timeline}
                      />
                    );
                  }

                  return (
                    <SortableTimeline
                      key={timeline.id}
                      timeline={timeline}
                      server={server}
                      onDelete={onDeleteTimeline}
                      isDeleting={isDeleting}
                    />
                  );
                })}
              </SortableContext>
            ) : (
              <Card className="flex flex-1 items-center justify-center">
                <Text>{t("list.noTimelinesCreated")}</Text>
              </Card>
            )}
            <Card className="flex h-full w-80 flex-[0_0_320px] flex-col items-center justify-center gap-0 rounded-none">
              <Button
                variant="ghost"
                className="flex h-full w-full flex-col items-center justify-center"
                onClick={onOpenDialog}
                disabled={servers.length === 0}
              >
                <Plus className="h-16 w-16 text-gray-400" />
                <Text className="mt-2 text-gray-500">
                  {servers.length === 0
                    ? t("list.addServerFirst")
                    : t("list.addTimeline")}
                </Text>
              </Button>
            </Card>
            <ClientCreateTimelineDialog
              isOpen={isDialogOpen}
              onClose={onCloseDialog}
              onSuccess={onDialogSuccess}
            />
          </Fragment>
        </DndContext>
      </div>
    </div>
  );
}
