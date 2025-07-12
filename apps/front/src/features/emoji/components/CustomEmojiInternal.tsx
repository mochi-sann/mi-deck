import { EmojiImg } from "./EmojiImg";

interface CustomEmojiInternalProps {
  name: string;
  host?: string;
  emojis?: { [key: string]: string };
}

export function CustomEmojiInternal({
  name,
  emojis,
}: CustomEmojiInternalProps) {
  // Only use local emoji data
  const localEmojiUrl = emojis?.[name];

  if (localEmojiUrl) {
    return <EmojiImg name={name} url={localEmojiUrl} />;
  }

  // Return emoji name if no URL found
  return <EmojiImg name={name} />;
}
