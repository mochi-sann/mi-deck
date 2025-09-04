import type { Note } from "misskey-js/entities.js";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { CustomEmoji } from "@/features/emoji";
import { cn } from "@/lib/utils";
import { useNoteReactions } from "../hooks/useNoteReactions";

interface NoteReactionsProps {
  note: Note;
  origin: string;
  emojis: Record<string, string>;
}

function NoteReactionsBase({ note, origin, emojis }: NoteReactionsProps) {
  console.log(
    ...[
      { note, origin, emojis },
      "👀 [NoteReactions.tsx:15]: { note, origin, emojis }",
    ].reverse(),
  );
  const { reactions, myReaction, toggleReaction, isReacting, isRemoving } =
    useNoteReactions({
      noteId: note.id,
      origin,
      note,
    });

  if (!reactions || reactions.length === 0) {
    return null;
  }

  const isLoading = isReacting || isRemoving;

  const getEmojiUrl = (reaction: string): string | null => {
    if (note.reactionEmojis?.[reaction]) return note.reactionEmojis[reaction];

    const match = reaction.match(/^:([a-zA-Z0-9_]+):$/);
    const name = match ? match[1] : null;
    if (name && emojis[name]) return emojis[name];

    return null;
  };

  return (
    <div className="flex flex-wrap gap-1 pt-2">
      {reactions.map(({ reaction, count }) => {
        const isMyReaction = myReaction === reaction;
        const isUnicodeEmoji = /^\p{Emoji}+$/u.test(reaction);
        const emojiUrl = getEmojiUrl(reaction);

        return (
          <Button
            key={reaction}
            variant={isMyReaction ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-7 px-2 py-1 text-xs transition-all",
              isMyReaction && "bg-primary text-primary-foreground",
              !isMyReaction && "hover:bg-muted",
              isLoading && "cursor-not-allowed opacity-50",
            )}
            onClick={() => !isLoading && toggleReaction(reaction)}
            disabled={isLoading}
          >
            <span className="flex items-center gap-1">
              {isUnicodeEmoji ? (
                <span className="text-sm">{reaction}</span>
              ) : emojiUrl ? (
                <img
                  src={emojiUrl}
                  alt={reaction}
                  className="h-4 w-4"
                  loading="lazy"
                />
              ) : (
                <CustomEmoji
                  name={reaction.replace(/:/g, "")}
                  emojis={emojis}
                />
              )}
              <span className="font-medium">{count}</span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}

export const NoteReactions = memo(NoteReactionsBase);
