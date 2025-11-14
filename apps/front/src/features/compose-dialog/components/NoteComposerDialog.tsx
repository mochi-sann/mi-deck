import type { NoteComposerDialogProps } from "@/features/compose-dialog/lib/note-composer-types";
import { RenoteDialogWrapper } from "@/features/notes/components/RenoteDialogWrapper";
import { StandardNoteComposerDialog } from "./StandardNoteComposerDialog";

export function NoteComposerDialog(props: NoteComposerDialogProps) {
  if (props.mode === "renote") {
    return <RenoteDialogWrapper {...props} />;
  }

  return <StandardNoteComposerDialog {...props} />;
}

export type {
  NoteComposerDialogProps,
  NoteComposerMode,
  RenoteDialogContext,
} from "@/features/compose-dialog/lib/note-composer-types";
