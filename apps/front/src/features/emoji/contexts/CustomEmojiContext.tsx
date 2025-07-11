import { createContext } from "react";

export const CustomEmojiCtx = createContext<{
  host: string | null;
  emojis?: { [key: string]: string } | undefined;
}>({
  host: null,
});
