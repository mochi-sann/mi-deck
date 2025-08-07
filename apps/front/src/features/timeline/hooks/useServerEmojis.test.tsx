import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { EmojiSimple } from "misskey-js/entities.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { storageManager } from "@/lib/storage";
import { useServerEmojis } from "./useServerEmojis";

vi.mock("@/lib/storage", () => ({
  storageManager: {
    initialize: vi.fn().mockResolvedValue(undefined),
    getAllServers: vi.fn(),
  },
}));

vi.mock("misskey-js", () => ({
  api: {
    // biome-ignore lint/style/useNamingConvention: 予約済み
    APIClient: vi.fn().mockImplementation(() => ({
      request: vi.fn(),
    })),
  },
}));

const mockEmojis: EmojiSimple[] = [
  {
    name: "test_emoji_1",
    category: "カテゴリ1",
    aliases: [],
    url: "https://example.com/emoji1.png",
    roleIdsThatCanBeUsedThisEmojiAsReaction: [],
  },
  {
    name: "test_emoji_2",
    category: "カテゴリ2",
    aliases: ["emoji2_alias"],
    url: "https://example.com/emoji2.png",
    roleIdsThatCanBeUsedThisEmojiAsReaction: ["role1"],
  },
  {
    name: "test_emoji_3",
    category: null,
    aliases: [],
    url: "https://example.com/emoji3.png",
    roleIdsThatCanBeUsedThisEmojiAsReaction: [],
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useServerEmojis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should initialize with correct default values", () => {
    vi.mocked(storageManager.getAllServers).mockResolvedValue([
      {
        id: "server-1",
        origin: "https://test.example.com",
        accessToken: "test-token",
        isActive: true,
        userInfo: {
          id: "user-id",
          username: "testuser",
          name: "Test User",
        },
        serverInfo: {
          name: "Test Server",
          version: "1.0.0",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const { result } = renderHook(
      () =>
        useServerEmojis({
          origin: "https://test.example.com",
          userRoleIds: [],
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.emojis).toEqual([]);
    expect(result.current.groupedEmojis).toEqual({});
    expect(result.current.categories).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("should filter emojis by user roles", async () => {
    vi.mocked(storageManager.getAllServers).mockResolvedValue([
      {
        id: "server-1",
        origin: "https://test.example.com",
        accessToken: "test-token",
        isActive: true,
        userInfo: {
          id: "user-id",
          username: "testuser",
          name: "Test User",
        },
        serverInfo: {
          name: "Test Server",
          version: "1.0.0",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const mockClient = {
      request: vi.fn().mockResolvedValue({
        emojis: mockEmojis,
      }),
    };

    vi.mocked(require("misskey-js").api.APIClient).mockImplementation(
      () => mockClient,
    );

    const { result } = renderHook(
      () =>
        useServerEmojis({
          origin: "https://test.example.com",
          userRoleIds: ["role1"], // role1を持つユーザー
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // role1が必要な絵文字も含まれるべき
    expect(result.current.emojis).toHaveLength(3);
    expect(result.current.emojis.map((e) => e.name)).toContain("test_emoji_2");
  });

  it("should group emojis by category", async () => {
    vi.mocked(storageManager.getAllServers).mockResolvedValue([
      {
        id: "server-1",
        origin: "https://test.example.com",
        accessToken: "test-token",
        isActive: true,
        userInfo: {
          id: "user-id",
          username: "testuser",
          name: "Test User",
        },
        serverInfo: {
          name: "Test Server",
          version: "1.0.0",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const mockClient = {
      request: vi.fn().mockResolvedValue({
        emojis: mockEmojis,
      }),
    };

    vi.mocked(require("misskey-js").api.APIClient).mockImplementation(
      () => mockClient,
    );

    const { result } = renderHook(
      () =>
        useServerEmojis({
          origin: "https://test.example.com",
          userRoleIds: ["role1"],
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.groupedEmojis).toEqual({
      // biome-ignore lint/style/useNamingConvention: Japanese category names for testing
      カテゴリ1: [mockEmojis[0]],
      // biome-ignore lint/style/useNamingConvention: Japanese category names for testing
      カテゴリ2: [mockEmojis[1]],
      // biome-ignore lint/style/useNamingConvention: Japanese category names for testing
      その他: [mockEmojis[2]],
    });

    expect(result.current.categories).toEqual([
      "カテゴリ1",
      "カテゴリ2",
      "その他",
    ]);
  });

  it("should search emojis by name and aliases", async () => {
    vi.mocked(storageManager.getAllServers).mockResolvedValue([
      {
        id: "server-1",
        origin: "https://test.example.com",
        accessToken: "test-token",
        isActive: true,
        userInfo: {
          id: "user-id",
          username: "testuser",
          name: "Test User",
        },
        serverInfo: {
          name: "Test Server",
          version: "1.0.0",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const mockClient = {
      request: vi.fn().mockResolvedValue({
        emojis: mockEmojis,
      }),
    };

    vi.mocked(require("misskey-js").api.APIClient).mockImplementation(
      () => mockClient,
    );

    const { result } = renderHook(
      () =>
        useServerEmojis({
          origin: "https://test.example.com",
          userRoleIds: ["role1"],
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 名前での検索
    const nameSearchResults = result.current.searchEmojis("emoji_1");
    expect(nameSearchResults).toHaveLength(1);
    expect(nameSearchResults[0].name).toBe("test_emoji_1");

    // エイリアスでの検索
    const aliasSearchResults = result.current.searchEmojis("emoji2_alias");
    expect(aliasSearchResults).toHaveLength(1);
    expect(aliasSearchResults[0].name).toBe("test_emoji_2");
  });

  it("should manage recent emojis", async () => {
    vi.mocked(storageManager.getAllServers).mockResolvedValue([
      {
        id: "server-1",
        origin: "https://test.example.com",
        accessToken: "test-token",
        isActive: true,
        userInfo: {
          id: "user-id",
          username: "testuser",
          name: "Test User",
        },
        serverInfo: {
          name: "Test Server",
          version: "1.0.0",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const mockClient = {
      request: vi.fn().mockResolvedValue({
        emojis: mockEmojis,
      }),
    };

    vi.mocked(require("misskey-js").api.APIClient).mockImplementation(
      () => mockClient,
    );

    const { result } = renderHook(
      () =>
        useServerEmojis({
          origin: "https://test.example.com",
          userRoleIds: ["role1"],
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 初期状態では最近使用した絵文字なし
    expect(result.current.getRecentEmojis()).toHaveLength(0);

    // 絵文字を最近使用したリストに追加
    result.current.addToRecentEmojis("test_emoji_1");
    result.current.addToRecentEmojis("test_emoji_2");

    // 最近使用した絵文字を取得
    const recentEmojis = result.current.getRecentEmojis();
    expect(recentEmojis).toHaveLength(2);
    expect(recentEmojis[0].name).toBe("test_emoji_2"); // 最後に使用したものが最初
    expect(recentEmojis[1].name).toBe("test_emoji_1");
  });
});
