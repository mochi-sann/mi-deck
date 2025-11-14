import type { Note } from "misskey-js/entities.js";
import type React from "react";
import type { MisskeyServerConnection } from "@/lib/storage/types";

export type NoteComposerMode = "create" | "reply" | "renote" | "quote";

export interface RenoteDialogContext {
  isRenoted: boolean;
  isProcessing: boolean;
  isStorageLoading: boolean;
  serversWithToken: MisskeyServerConnection[];
  determineInitialServerId: () => string | undefined;
  toggleRenote: (serverSessionId: string) => Promise<void>;
}

export interface NoteComposerDialogProps {
  mode: NoteComposerMode;
  trigger?: React.ReactNode;
  disabled?: boolean;
  replyTarget?: Note;
  quoteTarget?: Note;
  renoteTarget?: Note;
  origin?: string;
  initialServerId?: string;
  renoteContext?: RenoteDialogContext;
  open?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onOpenChange?: (open: boolean) => void;
  showSuccessMessage?: boolean;
}
