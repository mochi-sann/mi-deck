import { Heart } from "lucide-react";
import type { EmojiSimple, Note } from "misskey-js/entities.js";
import { memo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CustomEmojiPicker } from "@/features/timeline/components/CustomEmojiPicker";
import { cn } from "@/lib/utils";
import { useNoteReactions } from "../hooks/useNoteReactions";

interface ReactionButtonProps {
  note: Note;
  origin: string;
  emojis?: Record<string, string>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const QUICK_REACTIONS = ["❤️", "👍", "👎", "😂", "😢", "😮", "😡", "👏"];

function ReactionButtonBase({
  note,
  origin,
  emojis = {},
  open,
  onOpenChange,
}: ReactionButtonProps) {
  const [isOpen, setIsOpen] = useState(open ?? false);
  useEffect(() => {
    if (open === undefined) return;
    setIsOpen(open);
  }, [open]);
  const {
    myReaction,
    totalReactionCount,
    toggleReaction,
    isReacting,
    isRemoving,
    refetchReactions,
  } = useNoteReactions({
    noteId: note.id,
    origin,
    note,
  });

  const isLoading = isReacting || isRemoving;
  const hasMyReaction = !!myReaction;
  const isControlled = open !== undefined;
  const resolvedOpen = isControlled ? (open ?? false) : isOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setIsOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleQuickReaction = async (reaction: string) => {
    await toggleReaction(reaction);
    await refetchReactions();
    handleOpenChange(false);
  };

  const handleCustomEmojiSelect = async (emoji: EmojiSimple) => {
    await toggleReaction(`:${emoji.name}:`);
    await refetchReactions();
    handleOpenChange(false);
  };

  return (
    <Popover open={resolvedOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3 text-muted-foreground hover:text-foreground",
            hasMyReaction && "text-red-500 hover:text-red-600",
            isLoading && "cursor-not-allowed opacity-50",
          )}
          disabled={isLoading}
        >
          <Heart className={cn("h-4 w-4", hasMyReaction && "fill-current")} />
          <span className="ml-1 text-xs">{totalReactionCount || 0}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <div className="mb-2">
          <h3 className="mb-2 font-medium text-sm">クイックリアクション</h3>
          <div className="grid grid-cols-4 gap-1">
            {QUICK_REACTIONS.map((reaction) => (
              <Button
                key={reaction}
                variant={myReaction === reaction ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-10 w-full text-lg hover:bg-muted",
                  myReaction === reaction &&
                    "bg-primary text-primary-foreground",
                )}
                onClick={() => {
                  void handleQuickReaction(reaction);
                }}
                disabled={isLoading}
              >
                {reaction}
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-2" />

        <div className="mb-2">
          <h3 className="mb-2 font-medium text-sm">カスタム絵文字</h3>
          <CustomEmojiPicker
            origin={origin}
            onEmojiSelect={(name) => {
              void handleCustomEmojiSelect({ name } as EmojiSimple);
            }}
            reactionEmojis={note.reactionEmojis}
            fallbackEmojis={emojis}
          />
        </div>

        {hasMyReaction && (
          <>
            <Separator className="my-2" />
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                void (async () => {
                  await toggleReaction(myReaction!);
                  await refetchReactions();
                  setIsOpen(false);
                })();
              }}
              disabled={isLoading}
            >
              リアクションを取り消す
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export const ReactionButton = memo(ReactionButtonBase);
