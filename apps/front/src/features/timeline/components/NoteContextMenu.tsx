import { APIClient } from "misskey-js/api.js";
import type { Note } from "misskey-js/entities.js";
import {
  BookmarkIcon,
  Link2,
  MessageSquareQuote,
  Repeat2,
  UserRound,
  VolumeX,
} from "lucide-react";
import type { MouseEvent as ReactMouseEvent, ReactElement, ReactNode } from "react";
import { Children, cloneElement, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { NoteComposerDialog } from "@/features/compose-dialog/components/NoteComposerDialog";
import { useRenoteAction } from "@/features/notes/actions/useRenoteAction";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import { resolveNoteUrl, resolveUserUrl } from "./note-utils";

type NoteContextMenuProps = {
  note: Note;
  origin: string;
  children: ReactElement;
};

type MenuPosition = { x: number; y: number };

const MENU_WIDTH = 240;
const MENU_HEIGHT = 264;

export function NoteContextMenu({
  note,
  origin,
  children,
}: NoteContextMenuProps) {
  const { t } = useTranslation("timeline");
  const {
    isRenoted,
    isProcessing,
    isStorageLoading,
    serversWithToken,
    determineInitialServerId,
    toggleRenote,
  } = useRenoteAction({ note, origin });

  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [renoteDialogOpen, setRenoteDialogOpen] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [muting, setMuting] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const noteUrl = useMemo(
    () => resolveNoteUrl(note, origin),
    [note, origin],
  );
  const userProfileUrl = useMemo(
    () => resolveUserUrl(note.user, origin),
    [note.user, origin],
  );

  const closeMenu = () => setMenuPosition(null);

  useEffect(() => {
    if (!menuPosition) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("contextmenu", handlePointerDown);
    document.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("blur", closeMenu);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("contextmenu", handlePointerDown);
      document.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("blur", closeMenu);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuPosition]);

  const pickServer = (): MisskeyServerConnection | undefined => {
    if (serversWithToken.length === 0) return undefined;
    const preferredId = determineInitialServerId();
    if (preferredId) {
      const preferred = serversWithToken.find((server) => server.id === preferredId);
      if (preferred?.accessToken) return preferred;
    }
    return serversWithToken.find((server) => Boolean(server.accessToken));
  };

  const ensureServer = (): MisskeyServerConnection | undefined => {
    const server = pickServer();
    if (!server || !server.accessToken) {
      toast({
        variant: "destructive",
        title: t("contextMenu.noServer"),
      });
      return undefined;
    }
    return server;
  };

  const performApiAction = async (
    action: string,
    payload: Record<string, unknown>,
    messages: { success: string; error: string },
    onStart?: () => void,
    onDone?: () => void,
  ) => {
    const server = ensureServer();
    if (!server) return;

    try {
      onStart?.();
      const client = new APIClient({
        origin: server.origin,
        credential: server.accessToken,
      });
      await client.request(action, payload);
      toast({ title: messages.success });
    } catch (error) {
      console.error(`Note context menu action ${action} failed`, error);
      toast({ variant: "destructive", title: messages.error });
    } finally {
      onDone?.();
    }
  };

  const handleContextMenu = (event: ReactMouseEvent) => {
    event.preventDefault();
    const x = Math.min(
      event.clientX,
      window.innerWidth - MENU_WIDTH - 8,
    );
    const y = Math.min(
      event.clientY,
      window.innerHeight - MENU_HEIGHT - 8,
    );
    setMenuPosition({ x, y });
  };

  const handleBookmark = () => {
    closeMenu();
    performApiAction(
      "notes/favorites/create",
      { noteId: note.id },
      {
        success: t("contextMenu.bookmarkSuccess"),
        error: t("contextMenu.bookmarkFailure"),
      },
      () => setBookmarking(true),
      () => setBookmarking(false),
    );
  };

  const handleMute = () => {
    closeMenu();
    performApiAction(
      "mute/create",
      { userId: note.user.id },
      {
        success: t("contextMenu.muteSuccess", {
          user: note.user.username,
        }),
        error: t("contextMenu.muteFailure"),
      },
      () => setMuting(true),
      () => setMuting(false),
    );
  };

  const handleProfile = () => {
    closeMenu();
    window.open(userProfileUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyUrl = async () => {
    closeMenu();
    try {
      await navigator.clipboard.writeText(noteUrl);
      toast({ title: t("contextMenu.copySuccess") });
    } catch (error) {
      console.error("Failed to copy note URL:", error);
      toast({
        variant: "destructive",
        title: t("contextMenu.copyFailure"),
      });
    }
  };

  const hasServers = serversWithToken.length > 0;

  const menuItems: Array<{
    key: string;
    label: string;
    icon: ReactNode;
    onSelect: () => void;
    disabled?: boolean;
  }> = [
    {
      key: "renote",
      label: t("contextMenu.renote"),
      icon: <Repeat2 className="h-4 w-4" aria-hidden />,
      onSelect: () => {
        closeMenu();
        setRenoteDialogOpen(true);
      },
      disabled: (!hasServers && !isRenoted) || isProcessing,
    },
    {
      key: "quote",
      label: t("contextMenu.quoteRenote"),
      icon: <MessageSquareQuote className="h-4 w-4" aria-hidden />,
      onSelect: () => {
        closeMenu();
        setQuoteDialogOpen(true);
      },
      disabled: !hasServers || isProcessing,
    },
    {
      key: "bookmark",
      label: t("contextMenu.bookmark"),
      icon: <BookmarkIcon className="h-4 w-4" aria-hidden />,
      onSelect: handleBookmark,
      disabled: !hasServers || bookmarking,
    },
    {
      key: "mute",
      label: t("contextMenu.mute"),
      icon: <VolumeX className="h-4 w-4" aria-hidden />,
      onSelect: handleMute,
      disabled: !hasServers || muting,
    },
    {
      key: "profile",
      label: t("contextMenu.viewProfile"),
      icon: <UserRound className="h-4 w-4" aria-hidden />,
      onSelect: handleProfile,
    },
    {
      key: "copy",
      label: t("contextMenu.copyUrl"),
      icon: <Link2 className="h-4 w-4" aria-hidden />,
      onSelect: handleCopyUrl,
    },
  ];

  const enhancedChild = cloneElement(Children.only(children), {
    onContextMenu: (event: React.MouseEvent) => {
      children.props.onContextMenu?.(event);
      handleContextMenu(event);
    },
  });

  const portalTarget = typeof document === "undefined" ? null : document.body;

  return (
    <>
      {enhancedChild}
      {menuPosition && portalTarget
        ? createPortal(
            <div
              className="fixed inset-0 z-50"
              aria-label={t("contextMenu.label", { defaultValue: "ノートコンテキストメニュー" })}
            >
              <div
                className="absolute inset-0"
                aria-hidden
                onContextMenu={(event) => event.preventDefault()}
              />
              <div
                ref={menuRef}
                className="absolute w-60 rounded-lg border border-border bg-popover p-1 shadow-lg backdrop-blur-sm"
                style={{ top: menuPosition.y, left: menuPosition.x }}
                role="menu"
              >
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    role="menuitem"
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      item.disabled
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-muted",
                    )}
                    onClick={item.disabled ? undefined : item.onSelect}
                    disabled={item.disabled}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>,
            portalTarget,
          )
        : null}

      <NoteComposerDialog
        mode="renote"
        open={renoteDialogOpen}
        disabled={(!hasServers && !isRenoted) || isProcessing}
        renoteTarget={note}
        origin={origin}
        renoteContext={renoteContext}
        showSuccessMessage={false}
        onOpenChange={setRenoteDialogOpen}
      />

      <NoteComposerDialog
        mode="quote"
        open={quoteDialogOpen}
        disabled={!hasServers || isProcessing}
        replyTarget={note}
        quoteTarget={note}
        origin={origin}
        initialServerId={initialServerId}
        onOpenChange={setQuoteDialogOpen}
      />
    </>
  );
}
