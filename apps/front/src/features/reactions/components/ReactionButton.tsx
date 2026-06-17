import { Heart } from "lucide-react";
import type { EmojiSimple, Note } from "misskey-js/entities.js";
import { lazy, memo, Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useNoteReactions } from "../hooks/useNoteReactions";

const CustomEmojiPicker = lazy(async () => {
  const module = await import("@/features/timeline/components/CustomEmojiPicker");
  return { default: module.CustomEmojiPicker };
});

interface ReactionButtonProps {
  note: Note;
  origin: string;
  emojis?: Record<string, string>;
}

const QUICK_REACTIONS = ["❤️", "👍", "👎", "😂", "😢", "😮", "😡", "👏"];

function ReactionButtonBase({
  note,
  origin,
  emojis = {},
}: ReactionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    myReaction,
    totalReactionCount,
    toggleReaction,
    isReacting,
    isRemoving,
  } = useNoteReactions({
    noteId: note.id,
    origin,
    note,
  });

  const isLoading = isReacting || isRemoving;
  const hasMyReaction = !!myReaction;

  const handleQuickReaction = async (reaction: string) => {
    await toggleReaction(reaction);
    setIsOpen(false);
  };

  const handleCustomEmojiSelect = async (emoji: EmojiSimple) => {
    await toggleReaction(`:${emoji.name}:`);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
          {isOpen ? (
            <Suspense fallback={<div className="h-48" />}>
              <CustomEmojiPicker
                origin={origin}
                onEmojiSelect={(name) => {
                  void handleCustomEmojiSelect({ name } as EmojiSimple);
                }}
                reactionEmojis={note.reactionEmojis}
                fallbackEmojis={emojis}
              />
            </Suspense>
          ) : null}
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
