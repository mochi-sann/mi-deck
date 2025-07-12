import { createStore } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { emojiCacheAtom, updateEmojiCacheAtom } from "./emoji-cache-database";

describe("emoji-cache-database", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    vi.clearAllMocks();

    // IndexedDBをクリア
    // biome-ignore lint/suspicious/noGlobalAssign: Test setup requires IndexedDB reset
    indexedDB = new IDBFactory();
  });

  describe("emojiCacheAtom", () => {
    it("initializes with empty cache", () => {
      const cache = store.get(emojiCacheAtom);
      expect(cache).toEqual({});
    });

    it("updates cache for specific host", async () => {
      const testCache = {
        "example.com": { smile: "https://example.com/smile.png" },
      };

      store.set(updateEmojiCacheAtom, {
        host: "example.com",
        cache: { smile: "https://example.com/smile.png" },
      });

      const cache = store.get(emojiCacheAtom);
      expect(cache).toEqual(testCache);
    });

    it("merges cache for same host", async () => {
      // 最初のキャッシュを追加
      store.set(updateEmojiCacheAtom, {
        host: "example.com",
        cache: { smile: "https://example.com/smile.png" },
      });

      // 同じホストに別の絵文字を追加
      store.set(updateEmojiCacheAtom, {
        host: "example.com",
        cache: { heart: "https://example.com/heart.png" },
      });

      const cache = store.get(emojiCacheAtom);
      expect(cache).toEqual({
        "example.com": {
          smile: "https://example.com/smile.png",
          heart: "https://example.com/heart.png",
        },
      });
    });

    it("handles multiple hosts", async () => {
      store.set(updateEmojiCacheAtom, {
        host: "example.com",
        cache: { smile: "https://example.com/smile.png" },
      });

      store.set(updateEmojiCacheAtom, {
        host: "another.com",
        cache: { laugh: "https://another.com/laugh.png" },
      });

      const cache = store.get(emojiCacheAtom);
      expect(cache).toEqual({
        "example.com": { smile: "https://example.com/smile.png" },
        "another.com": { laugh: "https://another.com/laugh.png" },
      });
    });

    it("handles null URLs", async () => {
      store.set(updateEmojiCacheAtom, {
        host: "example.com",
        cache: { missing: null },
      });

      const cache = store.get(emojiCacheAtom);
      expect(cache).toEqual({
        "example.com": { missing: null },
      });
    });

    it("overwrites existing emoji with new URL", async () => {
      // 最初のURL
      store.set(updateEmojiCacheAtom, {
        host: "example.com",
        cache: { smile: "https://example.com/smile.png" },
      });

      // 同じ絵文字を異なるURLで更新
      store.set(updateEmojiCacheAtom, {
        host: "example.com",
        cache: { smile: "https://example.com/new-smile.png" },
      });

      const cache = store.get(emojiCacheAtom);
      expect(cache).toEqual({
        "example.com": { smile: "https://example.com/new-smile.png" },
      });
    });
  });

  describe("updateEmojiCacheAtom", () => {
    it("is write-only atom", () => {
      expect(store.get(updateEmojiCacheAtom)).toBeNull();
    });

    it("accepts proper cache update format", () => {
      expect(() => {
        store.set(updateEmojiCacheAtom, {
          host: "test.com",
          cache: { test: "url" },
        });
      }).not.toThrow();
    });
  });
});
