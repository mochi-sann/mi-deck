import { lazy } from "react";

export const LazyNoteComposerDialog = lazy(async () => {
  const module = await import("./NoteComposerDialog");
  return { default: module.NoteComposerDialog };
});
