import { ReactionEmoji } from "./ReactionCount";

interface ReactionHoverContentProps {
  reaction: string;
  isUnicodeEmoji: boolean;
  emojiUrl: string | null;
  emojis: Record<string, string>;
  reactionsRaw: any[];
}

export function ReactionHoverContent({
  reaction,
  isUnicodeEmoji,
  emojiUrl,
  emojis,
  reactionsRaw,
}: ReactionHoverContentProps) {
  const filtered = Array.isArray(reactionsRaw)
    ? reactionsRaw.filter((r: any) => r?.type === reaction)
    : [];

  return (
    <div className="flex items-baseline gap-2">
      <div className="flex items-baseline">
        <ReactionEmoji
          reaction={reaction}
          isUnicodeEmoji={isUnicodeEmoji}
          emojiUrl={emojiUrl}
          emojis={emojis}
        />
      </div>
      <div className="border-l pl-2">
        {filtered.map((value: any) => (
          <div key={value.id} className="border-b p-1 last:border-0">
            {value?.user?.name}
          </div>
        ))}
      </div>
    </div>
  );
}
