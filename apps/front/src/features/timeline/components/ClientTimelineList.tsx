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
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ClientCreateTimelineDialog } from "@/components/parts/ClientCreateTimelineDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Text from "@/components/ui/text";
import { useStorage } from "@/lib/storage/context";
import { SortableTimeline } from "./SortbleTimeline";
import { TimelineEmptyState } from "./TimelineEmptyState";

export function ClientTimelineList() {
  const { t } = useTranslation("timeline");
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
        alert(t("list.reorderFailed"));
      }
    }
  };

  const handleDeleteTimeline = async (timelineId: string) => {
    setIsDeleting(true);
    try {
      await storage.deleteTimeline(timelineId);
    } catch (error) {
      console.error("Failed to delete timeline:", error);
      alert(t("list.deleteFailed"));
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
            <Text>{t("list.loading")}</Text>
            {storage.retryCount > 0 && (
              <Text className="text-muted-foreground text-sm">
                {t("list.retrying", { count: storage.retryCount })}
              </Text>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Allow access without authentication - users can add servers as needed

  return (
    <ScrollArea>
      <div className="flex h-screen overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
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
              <TimelineEmptyState
                onCreateTimeline={() => setIsDialogOpen(true)}
                canCreateTimeline={storage.servers.length > 0}
              />
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
                  ? t("list.addServerFirst")
                  : t("list.addTimeline")}
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
        </DndContext>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
