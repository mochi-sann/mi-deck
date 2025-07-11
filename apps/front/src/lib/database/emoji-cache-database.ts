import Dexie, { type EntityTable, liveQuery } from "dexie";
import { atom } from "jotai";
import type { EmojiCache, EmojiCacheEntry } from "@/types/emoji-cache";

const emojiCacheDbAtom = atom((_get) => {
  const db = new Dexie("@mideck-front-emoji-cache") as Dexie & {
    emojiCache: EntityTable<EmojiCacheEntry, "id">;
  };
  db.version(1).stores({
    emojiCache: "++id,host,name,url,&[host+name]",
  });
  return db;
});

const baseEmojiCacheAtom = atom<EmojiCache>({});

const INIT_EMOJI_CACHE = Symbol("INIT_EMOJI_CACHE");
const UPDATE_EMOJI_CACHE = Symbol("UPDATE_EMOJI_CACHE");

export const emojiCacheAtom = atom(
  (get) => get(baseEmojiCacheAtom),
  (get, set, action) => {
    const db = get(emojiCacheDbAtom);

    if (action === INIT_EMOJI_CACHE) {
      try {
        const observable = liveQuery(() => db.emojiCache.toArray());
        const sub = observable.subscribe((entries) => {
          const cache: EmojiCache = {};
          for (const entry of entries) {
            if (!cache[entry.host]) {
              cache[entry.host] = {};
            }
            cache[entry.host][entry.name] = entry.url;
          }
          set(baseEmojiCacheAtom, cache);
        });
        return sub;
      } catch (error) {
        console.error("Failed to subscribe to emoji cache changes:", error);
        return { unsubscribe: () => {} }; // Return a mock subscription
      }
    }

    if (typeof action === "object" && action !== null && "type" in action) {
      const {
        type,
        host,
        cache: hostCache,
      } = action as {
        type: typeof UPDATE_EMOJI_CACHE;
        host: string;
        cache: { [name: string]: string | null };
      };

      if (type === UPDATE_EMOJI_CACHE) {
        const currentCache = get(baseEmojiCacheAtom);
        const newCache = {
          ...currentCache,
          [host]: { ...currentCache[host], ...hostCache },
        };
        set(baseEmojiCacheAtom, newCache);

        // Dexieに保存
        const entries: EmojiCacheEntry[] = Object.entries(hostCache).map(
          ([name, url]) => ({
            host,
            name,
            url,
          }),
        );

        // upsert操作
        db.emojiCache.bulkPut(entries);
      }
    }
  },
);

emojiCacheAtom.onMount = (set) => {
  try {
    const sub = set(INIT_EMOJI_CACHE);
    return () => sub?.unsubscribe();
  } catch (error) {
    console.error("Failed to initialize emoji cache:", error);
    return () => {}; // Return a no-op cleanup function
  }
};

export const updateEmojiCacheAtom = atom(
  null,
  (
    _get,
    set,
    { host, cache }: { host: string; cache: { [name: string]: string | null } },
  ) => {
    set(emojiCacheAtom, {
      type: UPDATE_EMOJI_CACHE,
      host,
      cache,
    });
  },
);
