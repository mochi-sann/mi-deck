import {
  Heart,
  MessageCircle,
  MessageSquareQuote,
  Repeat2,
} from "lucide-react";
import { memo, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type NoteContextMenuProps = {
  position: { x: number; y: number };
  onClose: () => void;
  onReact: () => void;
  onReply: () => void;
  onRenote: () => void;
  onQuote: () => void;
  labels: {
    react: string;
    reply: string;
    renote: string;
    quote: string;
  };
  replyDisabled?: boolean;
  renoteDisabled?: boolean;
  quoteDisabled?: boolean;
};

function NoteContextMenuBase({
  position,
  onClose,
  onReact,
  onReply,
  onRenote,
  onQuote,
  labels,
  replyDisabled,
  renoteDisabled,
  quoteDisabled,
}: NoteContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [onClose]);

  const adjustedPosition = useMemo(() => {
    const padding = 8;
    const estimatedWidth = 240;
    const estimatedHeight = 220;
    if (typeof window === "undefined") {
      return { x: position.x, y: position.y };
    }

    const x = Math.min(
      Math.max(position.x, padding),
      window.innerWidth - estimatedWidth - padding,
    );
    const y = Math.min(
      Math.max(position.y, padding),
      window.innerHeight - estimatedHeight - padding,
    );

    return { x, y };
  }, [position.x, position.y]);

  if (typeof document === "undefined") {
    return null;
  }

  const itemClass =
    "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50";

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      onContextMenu={(event) => event.preventDefault()}
    >
      <div
        ref={menuRef}
        className="absolute min-w-56 rounded-md border bg-popover shadow-lg"
        style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
      >
        <div className="flex flex-col divide-y divide-border">
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              onReact();
              onClose();
            }}
          >
            <Heart className="h-4 w-4" aria-hidden />
            <span>{labels.react}</span>
          </button>
          <button
            type="button"
            className={itemClass}
            disabled={replyDisabled}
            onClick={() => {
              if (replyDisabled) return;
              onReply();
              onClose();
            }}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            <span>{labels.reply}</span>
          </button>
          <div className="flex flex-col">
            <button
              type="button"
              className={cn(itemClass, "rounded-none")}
              disabled={renoteDisabled}
              onClick={() => {
                if (renoteDisabled) return;
                onRenote();
                onClose();
              }}
            >
              <Repeat2 className="h-4 w-4" aria-hidden />
              <span>{labels.renote}</span>
            </button>
            <button
              type="button"
              className={cn(itemClass, "rounded-none")}
              disabled={quoteDisabled}
              onClick={() => {
                if (quoteDisabled) return;
                onQuote();
                onClose();
              }}
            >
              <MessageSquareQuote className="h-4 w-4" aria-hidden />
              <span>{labels.quote}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export const NoteContextMenu = memo(NoteContextMenuBase);
