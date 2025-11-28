import { MessageSquareQuote, Repeat2 } from "lucide-react";
import type { Note } from "misskey-js/entities.js";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NoteComposerDialog } from "@/features/compose-dialog/components/NoteComposerDialog";
import { useRenoteAction } from "@/features/notes/actions/useRenoteAction";
import { cn } from "@/lib/utils";

interface RenoteMenuProps {
  note: Note;
  origin: string;
}

export function RenoteMenu({ note, origin }: RenoteMenuProps) {
  const { t } = useTranslation("timeline");
  const [menuOpen, setMenuOpen] = useState(false);
  const [renoteDialogOpen, setRenoteDialogOpen] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);

  const {
    renoteCount,
    isRenoted,
    isProcessing,
    isStorageLoading,
    serversWithToken,
    determineInitialServerId,
    toggleRenote,
  } = useRenoteAction({ note, origin });

  const renoteContext = useMemo(
    () => ({
      isRenoted,
      isProcessing,
      isStorageLoading,
      serversWithToken,
      determineInitialServerId,
      toggleRenote,
    }),
    [
      determineInitialServerId,
      isProcessing,
      isRenoted,
      isStorageLoading,
      serversWithToken,
      toggleRenote,
    ],
  );

  const initialServerId = useMemo(
    () => determineInitialServerId(),
    [determineInitialServerId],
  );

  const hasServers = serversWithToken.length > 0;

  const buttonLabel = !hasServers
    ? t("renote.button.unavailable")
    : isRenoted
      ? t("renote.button.active")
      : t("renote.button.default");

  const triggerButton = (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 px-3 text-muted-foreground hover:text-foreground",
        isRenoted && "text-primary",
      )}
      aria-label={buttonLabel}
      aria-haspopup="menu"
      aria-expanded={menuOpen}
      aria-pressed={isRenoted}
      aria-busy={isProcessing}
      disabled={(!hasServers && !isRenoted) || isProcessing}
    >
      <Repeat2
        className={cn(
          "mr-2 h-4 w-4",
          isProcessing && "animate-spin",
          isRenoted && "text-primary",
        )}
        aria-hidden
      />
      <span className="font-medium text-sm">{renoteCount}</span>
      <span className="sr-only">{buttonLabel}</span>
    </Button>
  );

  return (
    <div className="space-y-1">
      <DropdownMenu onOpenChange={setMenuOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{buttonLabel}</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuItem
            disabled={(!hasServers && !isRenoted) || isProcessing}
            onSelect={(event) => {
              event.preventDefault();
              setMenuOpen(false);
              setRenoteDialogOpen(true);
            }}
          >
            <Repeat2 className="mr-2 h-4 w-4" aria-hidden />
            {isRenoted ? t("renote.menu.undoRenote") : t("renote.menu.renote")}
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={!hasServers || isProcessing}
            onSelect={(event) => {
              event.preventDefault();
              setMenuOpen(false);
              setQuoteDialogOpen(true);
            }}
          >
            <MessageSquareQuote className="mr-2 h-4 w-4" aria-hidden />
            {t("renote.menu.quote")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NoteComposerDialog
        mode="renote"
        open={renoteDialogOpen}
        disabled={(!hasServers && !isRenoted) || isProcessing}
        renoteTarget={note}
        origin={origin}
        renoteContext={renoteContext}
        showSuccessMessage={false}
        onOpenChange={(open) => {
          setRenoteDialogOpen(open);
        }}
      />

      <NoteComposerDialog
        mode="quote"
        open={quoteDialogOpen}
        disabled={!hasServers || isProcessing}
        replyTarget={note}
        quoteTarget={note}
        origin={origin}
        initialServerId={initialServerId}
        onOpenChange={(open) => {
          setQuoteDialogOpen(open);
        }}
      />
    </div>
  );
}
