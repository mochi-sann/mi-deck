import type { Note } from "misskey-js/entities.js";
import { memo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { useNoteEmojis } from "../hooks/useNoteEmojis";
import { useNoteReactions } from "../hooks/useNoteReactions";
import { ReactionCount } from "./ReactionCount";
import { ReactionHoverContent } from "./ReactionHoverContent";

interface NoteReactionsProps {
  note: Note;
  origin: string;
  emojis: Record<string, string>;
}

function NoteReactionsBase({ note, origin, emojis }: NoteReactionsProps) {
  const { allEmojis } = useNoteEmojis(note, origin);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const shouldLoadDetails = activeReaction !== null;
  const { reactions, myReaction, toggleReaction, reactionsRaw } =
    useNoteReactions({
      noteId: note.id,
      origin,
      note,
      shouldLoadDetails,
    });

  // if (!reactions || reactions.length === 0) {
  //   return null;
  // }

  // const isLoading = isReacting || isRemoving;

  const getEmojiUrl = useCallback(
    (reaction: string): string | null => {
      if (note.reactionEmojis?.[reaction]) return note.reactionEmojis[reaction];

      const parts = reaction.split(/[:@]/);
      const emojiName = parts[1];
      if (allEmojis[emojiName]) return allEmojis[emojiName];

      return null;
    },
    [allEmojis, note.reactionEmojis],
  );

  return (
    <div className="flex flex-wrap gap-1">
      {reactions.map(({ reaction, count }) => {
        const isMyReaction = reaction === myReaction;
        const isUnicodeEmoji = /^\p{Emoji}+$/u.test(reaction);
        const reactionDomain = (reaction.match(/@([^:]+):/) || ["", ""])[1];
        const isOwnServerCustomEmoji = reactionDomain === ".";
        const emojiUrl = getEmojiUrl(reaction);

        return (
          <HoverCard
            openDelay={100}
            key={reaction}
            open={activeReaction === reaction}
            onOpenChange={(open: boolean) =>
              setActiveReaction((prev) => {
                if (open) return reaction;
                return prev === reaction ? null : prev;
              })
            }
          >
            <HoverCardTrigger>
              {isUnicodeEmoji || isOwnServerCustomEmoji ? (
                <Button
                  variant={isMyReaction ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-7 px-2 py-1 text-xs transition-all",
                    isMyReaction
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                    // isLoading && "cursor-not-allowed opacity-50",
                  )}
                  onClick={() => {
                    void toggleReaction(reaction);
                  }}
                >
                  <ReactionCount
                    reaction={reaction}
                    count={count}
                    isUnicodeEmoji={isUnicodeEmoji}
                    emojiUrl={emojiUrl}
                    emojis={emojis}
                  />
                </Button>
              ) : (
                <ReactionCount
                  reaction={reaction}
                  count={count}
                  isUnicodeEmoji={isUnicodeEmoji}
                  emojiUrl={emojiUrl}
                  emojis={emojis}
                />
              )}
            </HoverCardTrigger>
            <HoverCardContent className="w-auto">
              <ReactionHoverContent
                reaction={reaction}
                isUnicodeEmoji={isUnicodeEmoji}
                emojiUrl={emojiUrl}
                emojis={emojis}
                reactionsRaw={reactionsRaw}
                emojiSize="40px"
              />
            </HoverCardContent>
          </HoverCard>
        );
      })}
    </div>
  );
}

export const NoteReactions = memo(NoteReactionsBase);
