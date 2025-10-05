import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { EmojiSimple } from "misskey-js/entities.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { storageManager } from "@/lib/storage";
import { useCustomEmojis } from "./useCustomEmojis";

// モックデータ
const mockEmojis: EmojiSimple[] = [
  {
    name: "happy",
    category: "emotions",
    aliases: ["smile", "joy"],
    url: "https://example.com/happy.png",
    localOnly: false,
    isSensitive: false,
    roleIdsThatCanBeUsedThisEmojiAsReaction: [],
  },
  {
    name: "sad",
    category: "emotions",
    aliases: ["cry"],
    url: "https://example.com/sad.png",
    localOnly: false,
    isSensitive: false,
    roleIdsThatCanBeUsedThisEmojiAsReaction: ["admin-role"],
  },
  {
    name: "custom",
    category: null,
    aliases: [],
    url: "https://example.com/custom.png",
    localOnly: true,
    isSensitive: false,
    roleIdsThatCanBeUsedThisEmojiAsReaction: [],
  },
  {
    name: "animal_cat",
    category: "animals",
    aliases: ["cat", "neko"],
    url: "https://example.com/cat.png",
    localOnly: false,
    isSensitive: false,
    roleIdsThatCanBeUsedThisEmojiAsReaction: [],
  },
];

// Misskeyクライアントのモック
const mockMisskeyClient = {
  request: vi.fn(),
};

vi.mock("misskey-js", () => ({
  api: {
    // biome-ignore lint/style/useNamingConvention: External library naming convention
    APIClient: vi.fn(() => mockMisskeyClient),
  },
}));

vi.mock("@/lib/storage", () => ({
  storageManager: {
    initialize: vi.fn(),
    getAllServers: vi.fn(),
  },
}));

describe("useCustomEmojis", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // ストレージマネージャーのモック設定
    vi.mocked(storageManager.initialize).mockResolvedValue();
    vi.mocked(storageManager.getAllServers).mockResolvedValue([
      {
        id: "1",
        origin: "https://example.misskey.com",
        accessToken: "test-token",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // APIクライアントのモック設定
    mockMisskeyClient.request.mockResolvedValue({
      emojis: mockEmojis,
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("カスタム絵文字一覧を正常に取得できる", async () => {
    const { result } = renderHook(
      () => useCustomEmojis({ origin: "https://example.misskey.com" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.emojis).toEqual(mockEmojis);
    expect(mockMisskeyClient.request).toHaveBeenCalledWith("emojis", {});
  });

  it("絵文字をカテゴリ別にグループ化できる", async () => {
    const { result } = renderHook(
      () => useCustomEmojis({ origin: "https://example.misskey.com" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const emojiGroups = result.current.emojiGroups;

    // animalsカテゴリ
    expect(emojiGroups[0]).toEqual({
      category: "animals",
      emojis: [mockEmojis[3]], // animal_cat
    });

    // emotionsカテゴリ
    expect(emojiGroups[1]).toEqual({
      category: "emotions",
      emojis: [mockEmojis[0], mockEmojis[1]], // happy, sad（名前順）
    });

    // カテゴリなし（最後）
    expect(emojiGroups[2]).toEqual({
      category: null,
      emojis: [mockEmojis[2]], // custom
    });
  });

  it("絵文字を検索できる", async () => {
    const { result } = renderHook(
      () => useCustomEmojis({ origin: "https://example.misskey.com" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 名前で検索
    expect(result.current.searchEmojis("happy")).toEqual([mockEmojis[0]]);

    // エイリアスで検索
    expect(result.current.searchEmojis("cat")).toEqual([mockEmojis[3]]);

    // 部分一致検索
    expect(result.current.searchEmojis("sad")).toEqual([mockEmojis[1]]); // sad

    // 空の検索クエリ
    expect(result.current.searchEmojis("")).toEqual(mockEmojis);
  });

  it("特定のカテゴリの絵文字を取得できる", async () => {
    const { result } = renderHook(
      () => useCustomEmojis({ origin: "https://example.misskey.com" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.getEmojisByCategory("emotions")).toEqual([
      mockEmojis[0], // happy
      mockEmojis[1], // sad
    ]);

    expect(result.current.getEmojisByCategory("animals")).toEqual([
      mockEmojis[3], // animal_cat
    ]);

    expect(result.current.getEmojisByCategory(null)).toEqual([
      mockEmojis[2], // custom
    ]);
  });

  it("リアクションとして使用可能な絵文字のみフィルタリングできる", async () => {
    const { result } = renderHook(
      () => useCustomEmojis({ origin: "https://example.misskey.com" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 一般ユーザー（ロールなし）
    const generalUserEmojis = result.current.getReactionableEmojis([]);
    expect(generalUserEmojis).toEqual([
      mockEmojis[0], // happy（制限なし）
      mockEmojis[2], // custom（制限なし）
      mockEmojis[3], // animal_cat（制限なし）
    ]);

    // 管理者ロールを持つユーザー
    const adminUserEmojis = result.current.getReactionableEmojis([
      "admin-role",
    ]);
    expect(adminUserEmojis).toEqual(mockEmojis); // 全ての絵文字が使用可能
  });

  it("サーバーが見つからない場合エラーを投げる", async () => {
    vi.mocked(storageManager.getAllServers).mockResolvedValue([]);

    const { result } = renderHook(
      () => useCustomEmojis({ origin: "https://nonexistent.misskey.com" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toContain("No active server found");
  });

  it("APIエラーを適切に処理する", async () => {
    mockMisskeyClient.request.mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(
      () => useCustomEmojis({ origin: "https://example.misskey.com" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("API Error");
  });
});
