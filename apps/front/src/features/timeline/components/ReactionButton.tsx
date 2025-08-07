import { Heart } from "lucide-react";
import type { Note } from "misskey-js/entities.js";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useNoteReactions } from "../hooks/useNoteReactions";

interface ReactionButtonProps {
  note: Note;
  origin: string;
}

const QUICK_REACTIONS = ["❤️", "👍", "👎", "😂", "😢", "😮", "😡", "👏"];

function ReactionButtonBase({ note, origin }: ReactionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { myReaction, toggleReaction, isReacting, isRemoving } =
    useNoteReactions({
      noteId: note.id,
      origin,
      note,
    });

  const isLoading = isReacting || isRemoving;
  const hasMyReaction = !!myReaction;

  const handleQuickReaction = (reaction: string) => {
    toggleReaction(reaction);
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
          <span className="ml-1 text-xs">{note.reactionCount || 0}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-4 gap-1">
          {QUICK_REACTIONS.map((reaction) => (
            <Button
              key={reaction}
              variant={myReaction === reaction ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-10 w-full text-lg hover:bg-muted",
                myReaction === reaction && "bg-primary text-primary-foreground",
              )}
              onClick={() => handleQuickReaction(reaction)}
              disabled={isLoading}
            >
              {reaction}
            </Button>
          ))}
        </div>
        {hasMyReaction && (
          <div className="mt-2 border-t pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                toggleReaction(myReaction!);
                setIsOpen(false);
              }}
              disabled={isLoading}
            >
              リアクションを取り消す
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export const ReactionButton = memo(ReactionButtonBase);
