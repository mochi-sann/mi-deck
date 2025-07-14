import { EmojiImg } from "./EmojiImg";

interface CustomEmojiInternalProps {
  name: string;
  host: string;
  emojis?: { [key: string]: string };
}

export function CustomEmojiInternal({
  name,
  emojis,
}: CustomEmojiInternalProps) {
  // Only use emoji data provided via props
  const emojiUrl = emojis?.[name];
  return <EmojiImg name={name} url={emojiUrl} />;
}
