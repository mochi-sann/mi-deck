import { useNoteReactions } from "../hooks/useNoteReactions";
import { ReactionEmoji, ReactionEmojiProps } from "./ReactionCount";

interface ReactionHoverContentProps {
  reaction: string;
  isUnicodeEmoji: boolean;
  emojiUrl: string | null;
  emojis: Record<string, string>;
  reactionsRaw: ReturnType<typeof useNoteReactions>["reactionsRaw"];
  emojiSize?: ReactionEmojiProps["size"];
}

export function ReactionHoverContent({
  reaction,
  isUnicodeEmoji,
  emojiUrl,
  emojis,
  reactionsRaw,
  emojiSize = "sm",
}: ReactionHoverContentProps) {
  const filtered = reactionsRaw.filter((reactionEntry) => {
    return reactionEntry.reaction === reaction;
  });

  return (
    <div className="flex items-baseline gap-2">
      <div className="flex items-baseline">
        <ReactionEmoji
          reaction={reaction}
          isUnicodeEmoji={isUnicodeEmoji}
          emojiUrl={emojiUrl}
          emojis={emojis}
          size={emojiSize}
        />
      </div>
      <div className="border-l pl-2">
        {filtered.map((value) => {
          const displayName =
            value.user?.name ??
            value.user?.username ??
            value.user?.id ??
            value.id;
          return (
            <div key={value.id} className="border-b p-1 last:border-0">
              {displayName}
            </div>
          );
        })}
      </div>
    </div>
  );
}
