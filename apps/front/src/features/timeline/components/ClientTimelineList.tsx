import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStorage } from "@/lib/storage/context";
import { ClientTimelineListPresenter } from "./ClientTimelineListPresenter";

export function ClientTimelineList() {
  const { t } = useTranslation("timeline");
  const storage = useStorage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const visibleTimelines = storage.timelines
    .filter((t) => t.isVisible)
    .sort((a, b) => a.order - b.order);

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

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);
  const handleDialogSuccess = () => setIsDialogOpen(false);

  return (
    <ClientTimelineListPresenter
      timelines={storage.timelines}
      servers={storage.servers}
      isLoading={storage.isLoading}
      retryCount={storage.retryCount}
      isDeleting={isDeleting}
      isDialogOpen={isDialogOpen}
      onDragEnd={handleDragEnd}
      onDeleteTimeline={handleDeleteTimeline}
      onOpenDialog={handleOpenDialog}
      onCloseDialog={handleCloseDialog}
      onDialogSuccess={handleDialogSuccess}
    />
  );
}
