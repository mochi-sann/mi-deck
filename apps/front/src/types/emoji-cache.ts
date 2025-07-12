export type EmojiCacheEntry = {
  id?: string;
  host: string;
  name: string;
  url: string | null;
};

export type EmojiCache = {
  [host: string]: { [name: string]: string | null };
};
