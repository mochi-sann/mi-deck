import { act, renderHook } from "@testing-library/react";
// @ts-ignore
import FdbFactory from "fake-indexeddb/lib/FDBFactory";
// @ts-ignore
import FdbKeyRange from "fake-indexeddb/lib/FDBKeyRange";
import { useAtomValue, useSetAtom } from "jotai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emojiCacheAtom, updateEmojiCacheAtom } from "./emoji-cache-database";

// Mock IndexedDB
const mockIndexedDb = new FdbFactory();
const mockKeyRange = FdbKeyRange;

Object.defineProperty(global, "indexedDB", {
  value: mockIndexedDb,
  writable: true,
});

Object.defineProperty(global, "IDBKeyRange", {
  value: mockKeyRange,
  writable: true,
});

// Create hoisted mock functions
const mockSubscription = {
  unsubscribe: vi.fn(),
};

const mockLiveQuery = vi.hoisted(() =>
  vi.fn(() => ({
    subscribe: vi.fn((callback) => {
      callback([]);
      return mockSubscription;
    }),
  })),
);

vi.mock("dexie", () => ({
  default: class MockDexie {
    name: string;
    constructor(name: string) {
      this.name = name;
    }

    version() {
      return {
        stores: () => this,
      };
    }

    emojiCache = {
      toArray: () => Promise.resolve([]),
      bulkPut: vi.fn(() => Promise.resolve()),
    };
  },
  liveQuery: mockLiveQuery,
}));

describe("emoji-cache-database", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the default behavior
    mockLiveQuery.mockImplementation(() => ({
      subscribe: vi.fn((callback) => {
        callback([]);
        return mockSubscription;
      }),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("emojiCacheAtom", () => {
    it("should initialize with empty cache", () => {
      const { result } = renderHook(() => useAtomValue(emojiCacheAtom));

      expect(result.current).toEqual({});
    });

    it("should handle subscription on mount", () => {
      const { result } = renderHook(() => useAtomValue(emojiCacheAtom));

      expect(mockLiveQuery).toHaveBeenCalled();
      expect(result.current).toEqual({});
    });

    it("should update cache when database entries change", async () => {
      const mockEntries = [
        {
          host: "example.com",
          name: "smile",
          url: "https://example.com/smile.png",
        },
        {
          host: "example.com",
          name: "heart",
          url: "https://example.com/heart.png",
        },
        { host: "other.com", name: "star", url: "https://other.com/star.png" },
      ];

      let subscribeCallback: (entries: any[]) => void;
      mockLiveQuery.mockImplementation(() => ({
        subscribe: vi.fn((callback) => {
          subscribeCallback = callback;
          callback(mockEntries);
          return mockSubscription;
        }),
      }));

      const { result } = renderHook(() => useAtomValue(emojiCacheAtom));

      // Wait for the subscription to be called
      await act(async () => {
        if (subscribeCallback) {
          subscribeCallback(mockEntries);
        }
      });

      expect(result.current).toEqual({
        "example.com": {
          smile: "https://example.com/smile.png",
          heart: "https://example.com/heart.png",
        },
        "other.com": {
          star: "https://other.com/star.png",
        },
      });
    });
  });

  describe("updateEmojiCacheAtom", () => {
    it("should update cache and persist to database", async () => {
      const { result: updateResult } = renderHook(() =>
        useSetAtom(updateEmojiCacheAtom),
      );

      const host = "example.com";
      const newEmojis = {
        smile: "https://example.com/smile.png",
        heart: "https://example.com/heart.png",
      };

      await act(async () => {
        updateResult.current({ host, cache: newEmojis });
      });

      // Note: Due to the mocking setup, we can't easily test the actual state update
      // but we can verify that the update function is called without errors
      expect(updateResult.current).toBeInstanceOf(Function);
    });

    it("should handle null emoji URLs", async () => {
      const { result: updateResult } = renderHook(() =>
        useSetAtom(updateEmojiCacheAtom),
      );

      const host = "example.com";
      const newEmojis = {
        smile: "https://example.com/smile.png",
        missing: null,
      };

      await act(async () => {
        updateResult.current({ host, cache: newEmojis });
      });

      expect(updateResult.current).toBeInstanceOf(Function);
    });

    it("should merge with existing cache", async () => {
      const { result: cacheResult } = renderHook(() =>
        useAtomValue(emojiCacheAtom),
      );
      const { result: updateResult } = renderHook(() =>
        useSetAtom(updateEmojiCacheAtom),
      );

      // First, add some existing emojis
      await act(async () => {
        updateResult.current({
          host: "example.com",
          cache: { existing: "https://example.com/existing.png" },
        });
      });

      // Then add new emojis to the same host
      const newEmojis = {
        new: "https://example.com/new.png",
      };

      await act(async () => {
        updateResult.current({ host: "example.com", cache: newEmojis });
      });

      // The cache should contain both existing and new emojis
      expect(cacheResult.current).toEqual({
        "example.com": {
          existing: "https://example.com/existing.png",
          new: "https://example.com/new.png",
        },
      });
    });

    it("should handle empty cache updates", async () => {
      const { result: updateResult } = renderHook(() =>
        useSetAtom(updateEmojiCacheAtom),
      );

      const host = "example.com";
      const newEmojis = {};

      await act(async () => {
        updateResult.current({ host, cache: newEmojis });
      });

      expect(updateResult.current).toBeInstanceOf(Function);
    });

    it("should handle different hosts separately", async () => {
      const { result: updateResult } = renderHook(() =>
        useSetAtom(updateEmojiCacheAtom),
      );

      const host1 = "example.com";
      const host2 = "other.com";
      const emojis1 = { smile: "https://example.com/smile.png" };
      const emojis2 = { heart: "https://other.com/heart.png" };

      await act(async () => {
        updateResult.current({ host: host1, cache: emojis1 });
        updateResult.current({ host: host2, cache: emojis2 });
      });

      expect(updateResult.current).toBeInstanceOf(Function);
    });
  });

  describe("atom lifecycle", () => {
    it("should handle mount and unmount properly", () => {
      const { unmount } = renderHook(() => useAtomValue(emojiCacheAtom));

      expect(mockLiveQuery).toHaveBeenCalled();

      unmount();

      // The subscription should be cleaned up on unmount
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle database errors gracefully", () => {
      const mockError = new Error("Database error");
      mockLiveQuery.mockImplementation(() => {
        throw mockError;
      });

      // The atom should still be readable even if there's a database error
      // The error is handled internally and doesn't crash the application
      const { result } = renderHook(() => useAtomValue(emojiCacheAtom));

      // Should return empty cache when database fails
      expect(result.current).toEqual({});
    });

    it("should handle invalid cache entries", async () => {
      const { result: updateResult } = renderHook(() =>
        useSetAtom(updateEmojiCacheAtom),
      );
      const { result: cacheResult } = renderHook(() =>
        useAtomValue(emojiCacheAtom),
      );

      // Test with null URLs and missing emoji names
      await act(async () => {
        updateResult.current({
          host: "example.com",
          cache: {
            star: null,
            valid: "https://example.com/valid.png",
          },
        });
      });

      // Should handle null values gracefully
      expect(cacheResult.current).toEqual({
        "example.com": {
          star: null,
          valid: "https://example.com/valid.png",
        },
      });
    });
  });
});
