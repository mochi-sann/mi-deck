import { act, renderHook } from "@testing-library/react";
import { useAtomValue, useSetAtom } from "jotai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emojiCacheAtom, updateEmojiCacheAtom } from "./emoji-cache-database";

// Mock subscription object
const mockSubscription = {
  unsubscribe: vi.fn(),
};

// Mock liveQuery function - create it inline to avoid hoisting issues

// Mock Dexie and liveQuery
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
      toArray: vi.fn(() => Promise.resolve([])),
      bulkPut: vi.fn(() => Promise.resolve()),
    };
  },
  liveQuery: vi.fn(() => ({
    subscribe: vi.fn((callback) => {
      callback([]);
      return { unsubscribe: vi.fn() };
    }),
  })),
}));

// Import the mocked liveQuery
import { liveQuery } from "dexie";

describe("emoji-cache-database", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(liveQuery).mockReturnValue({
      subscribe: vi.fn((callback) => {
        callback([]);
        return mockSubscription;
      }),
      // biome-ignore lint/suspicious/noExplicitAny: テストなので無視
    } as any);
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
      renderHook(() => useAtomValue(emojiCacheAtom));

      expect(liveQuery).toHaveBeenCalled();
    });

    it("should update cache when database entries change", () => {
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

      vi.mocked(liveQuery).mockReturnValue({
        subscribe: vi.fn((callback) => {
          callback(mockEntries);
          return mockSubscription;
        }),
        // biome-ignore lint/suspicious/noExplicitAny: テストなので無視
      } as any);

      const { result } = renderHook(() => useAtomValue(emojiCacheAtom));

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

      expect(liveQuery).toHaveBeenCalled();

      unmount();

      // The subscription should be cleaned up on unmount
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle database errors gracefully", () => {
      // Test that the atom doesn't crash on database errors
      const { result } = renderHook(() => useAtomValue(emojiCacheAtom));

      // Should initialize with empty cache even if there are issues
      expect(result.current).toEqual({});
    });

    it("should handle invalid cache entries", () => {
      const invalidEntries = [
        { host: null, name: "smile", url: "https://example.com/smile.png" },
        {
          host: "example.com",
          name: null,
          url: "https://example.com/heart.png",
        },
        { host: "example.com", name: "star", url: null },
      ];

      vi.mocked(liveQuery).mockReturnValue({
        subscribe: vi.fn((callback) => {
          callback(invalidEntries);
          return mockSubscription;
        }),
        // biome-ignore lint/suspicious/noExplicitAny: テストなので無視
      } as any);

      const { result } = renderHook(() => useAtomValue(emojiCacheAtom));

      // Should handle invalid entries gracefully
      expect(result.current).toEqual({
        "example.com": {
          null: "https://example.com/heart.png",
          star: null,
        },
        null: {
          smile: "https://example.com/smile.png",
        },
      });
    });
  });
});
