import type { Note } from "misskey-js/entities.js";
import { memo } from "react";
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
  console.log(
    ...[
      { note, origin, emojis },
      note.text,
      "👀 [NoteReactions.tsx:15]: { note, origin, emojis }",
    ].reverse(),
  );
  const {
    reactions,
    myReaction,
    toggleReaction,
    isReacting,
    isRemoving,
    buttonRef,
    isReactionButtonHover,
    reactionsRaw,
  } = useNoteReactions({
    noteId: note.id,
    origin,
    note,
  });

  // if (!reactions || reactions.length === 0) {
  //   return null;
  // }

  // const isLoading = isReacting || isRemoving;

  const getEmojiUrl = (reaction: string): string | null => {
    if (note.reactionEmojis?.[reaction]) return note.reactionEmojis[reaction];

    const parts = reaction.split(/[:@]/);
    // 配列から必要な部分を取り出す
    const emojiName = parts[1];
    console.log(...[emojiName, "👀 [NoteReactions.tsx:38]: match"].reverse());
    // const name = match ? match[1] : null;
    // if (name && emojis[name]) return emojis[name];
    // if (domain === ".") {
    //   return emojiName;
    // }
    if (allEmojis[emojiName]) return allEmojis[emojiName];

    return null;
  };
  console.log(...[note, "👀 [NoteReactions.tsx:54]: note"].reverse());

  return (
    <div className="flex flex-wrap gap-1 pt-2">
      {reactions.map(({ reaction, count }) => {
        const isMyReaction = reaction === myReaction;
        const isUnicodeEmoji = /^\p{Emoji}+$/u.test(reaction);
        const emojiUrl = getEmojiUrl(reaction);

        return (
          <HoverCard openDelay={100} key={reaction}>
            <HoverCardTrigger>
              <Button
                ref={buttonRef}
                variant={isMyReaction ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-7 px-2 py-1 text-xs transition-all",
                  isMyReaction
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                  // isLoading && "cursor-not-allowed opacity-50",
                )}
                onClick={() => toggleReaction(reaction)}
              >
                <ReactionCount
                  reaction={reaction}
                  count={count}
                  isUnicodeEmoji={isUnicodeEmoji}
                  emojiUrl={emojiUrl}
                  emojis={emojis}
                />
              </Button>{" "}
            </HoverCardTrigger>
            <HoverCardContent className="flex items-center">
              <ReactionHoverContent
                reaction={reaction}
                isUnicodeEmoji={isUnicodeEmoji}
                emojiUrl={emojiUrl}
                emojis={emojis}
                reactionsRaw={reactionsRaw}
              />
            </HoverCardContent>
          </HoverCard>
        );
      })}
    </div>
  );
}

export const NoteReactions = memo(NoteReactionsBase);
