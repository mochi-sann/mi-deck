import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import type { TimelineSettings } from "@/features/settings/stores/timelineSettings";
import { cn } from "@/lib/utils";

import type { NoteFile } from "./NoteAttachmentTypes";

type AttachmentGalleryProps = {
  files: NoteFile[];
  settings: TimelineSettings;
  isNsfw: boolean;
  isRevealed: boolean;
  onAttachmentClick: (file: NoteFile) => void;
};

export function AttachmentGallery({
  files,
  settings,
  isNsfw,
  isRevealed,
  onAttachmentClick,
}: AttachmentGalleryProps) {
  const { t: tTimeline } = useTranslation("timeline");
  const shouldBlurImages =
    isNsfw && settings.nsfwBehavior === "blur" && !isRevealed;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, file: NoteFile) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onAttachmentClick(file);
    }
  };

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <button
          key={file.id}
          type="button"
          className={cn(
            "relative overflow-hidden rounded-md",
            shouldBlurImages ? "cursor-pointer cursor-zoom-in" : "cursor-zoom-in",
          )}
          onClick={() => onAttachmentClick(file)}
          onKeyDown={(event) => handleKeyDown(event, file)}
          aria-label="画像を拡大表示"
        >
          <img
            src={file.url}
            alt="Note Attachment"
            className={cn(
              "mt-2 h-auto max-w-full rounded-md border",
              shouldBlurImages && "blur-xl transition-all duration-300",
            )}
          />
          {shouldBlurImages && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-black/50 px-3 py-1 font-medium text-sm text-white backdrop-blur-sm">
                {tTimeline("sensitive")}
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
