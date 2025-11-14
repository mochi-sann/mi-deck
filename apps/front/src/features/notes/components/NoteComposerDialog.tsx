import type { NoteComposerDialogProps } from "./note-composer-types";
import { RenoteDialogWrapper } from "./RenoteDialogWrapper";
import { StandardNoteComposerDialog } from "./compose-dialog/StandardNoteComposerDialog";

export function NoteComposerDialog(props: NoteComposerDialogProps) {
  if (props.mode === "renote") {
    return <RenoteDialogWrapper {...props} />;
  }

  return <StandardNoteComposerDialog {...props} />;
}

export type { NoteComposerDialogProps, NoteComposerMode, RenoteDialogContext } from "./note-composer-types";
