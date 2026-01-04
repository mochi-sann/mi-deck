import { Dialog, DialogContent } from "@/components/ui/dialog";

import type { NoteFile } from "./NoteAttachmentTypes";

type ImagePreviewDialogProps = {
  file: NoteFile | null;
  onClose: () => void;
};

export function ImagePreviewDialog({ file, onClose }: ImagePreviewDialogProps) {
  return (
    <Dialog
      open={Boolean(file)}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[90vw] max-w-[90vw] p-0 shadow-none"
        onClick={onClose}
      >
        {file && (
          <div className="relative flex max-h-[90vh] w-full cursor-zoom-out items-center justify-center overflow-hidden rounded-lg bg-background p-4">
            <img
              src={file.url}
              alt={file.name || "Note Attachment"}
              className="h-full max-h-[90vh] w-full max-w-[90vw] object-contain"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
