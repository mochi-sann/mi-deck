import { createContext } from "react";
import type { CustomEmojiContext } from "@/types/emoji";

export const CustomEmojiCtx = createContext<CustomEmojiContext>({
  host: null,
});
