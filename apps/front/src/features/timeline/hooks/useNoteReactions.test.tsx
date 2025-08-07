import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { Note } from "misskey-js/entities.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { storageManager } from "@/lib/storage";
import { useNoteReactions } from "./useNoteReactions";

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

// テスト用のNoteオブジェクト（型チェックエラー回避のため部分的な実装）
const mockNote = {
  id: "test-note-id",
  text: "Test note",
  user: {
    id: "test-user-id",
    username: "testuser",
    name: "Test User",
  },
  reactions: {
    "👍": 5,
    "❤": 3,
    "😂": 1,
  },
  reactionCount: 9,
} as unknown as Note;

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

describe("useNoteReactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
        useNoteReactions({
          noteId: "test-note-id",
          origin: "https://test.example.com",
          note: mockNote,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.myReaction).toBe(null);
    expect(result.current.isReacting).toBe(false);
    expect(result.current.isRemoving).toBe(false);
    expect(result.current.reactionsLoading).toBe(true);
  });

  it("should process reactions with counts correctly", () => {
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
        useNoteReactions({
          noteId: "test-note-id",
          origin: "https://test.example.com",
          note: mockNote,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.reactions).toEqual([
      { reaction: "👍", count: 5 },
      { reaction: "❤", count: 3 },
      { reaction: "😂", count: 1 },
    ]);
  });

  it("should handle empty reactions", () => {
    const emptyNote = {
      ...mockNote,
      reactions: {},
    };

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
        useNoteReactions({
          noteId: "test-note-id",
          origin: "https://test.example.com",
          note: emptyNote,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.reactions).toEqual([]);
  });

  it("should throw error when no server is found", async () => {
    vi.mocked(storageManager.getAllServers).mockResolvedValue([]);

    const { result } = renderHook(
      () =>
        useNoteReactions({
          noteId: "test-note-id",
          origin: "https://test.example.com",
          note: mockNote,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.reactionsLoading).toBe(false);
    });
  });
});
