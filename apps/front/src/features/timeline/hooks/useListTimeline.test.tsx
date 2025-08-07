import { act, renderHook } from "@testing-library/react";
import { Stream } from "misskey-js";
import { APIClient } from "misskey-js/api.js";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { useListTimeline } from "./useListTimeline";

// Mock misskey-js modules
vi.mock("misskey-js", () => ({
  // biome-ignore lint/style/useNamingConvention: misskey-js API class naming
  Stream: vi.fn(),
  // biome-ignore lint/style/useNamingConvention: misskey-js API class naming
  APIClient: vi.fn(),
}));

vi.mock("misskey-js/api.js", () => ({
  // biome-ignore lint/style/useNamingConvention: misskey-js API class naming
  APIClient: vi.fn(),
}));

describe("useListTimeline", () => {
  const mockOrigin = "https://example.com";
  const mockToken = "test-token";
  const mockListId = "test-list-id";

  // Mock APIClient
  const mockRequest = vi.fn();
  (APIClient as Mock).mockImplementation(() => ({
    request: mockRequest,
  }));

  // Mock Stream
  const mockChannel = {
    on: vi.fn(),
    dispose: vi.fn(),
  };
  const mockStream = {
    useChannel: vi.fn(() => mockChannel),
    on: vi.fn(),
    close: vi.fn(),
  };
  (Stream as unknown as Mock).mockImplementation(() => mockStream);

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest.mockReset();
    mockChannel.on.mockReset();
    mockStream.on.mockReset();
  });

  it("should fetch initial notes and setup WebSocket connection", async () => {
    const mockNotes = [{ id: "1", text: "Test note" }];
    mockRequest.mockResolvedValueOnce(mockNotes);

    const { result } = renderHook(() =>
      useListTimeline(mockOrigin, mockToken, mockListId),
    );

    // Check initial state
    expect(result.current.notes).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBe(true);
    expect(result.current.isLoading).toBe(true);

    // Wait for initial fetch
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Check if APIClient was called correctly
    expect(APIClient).toHaveBeenCalledWith({
      origin: mockOrigin,
      credential: mockToken,
    });
    expect(mockRequest).toHaveBeenCalledWith("notes/user-list-timeline", {
      listId: mockListId,
    });

    // Check if Stream was setup correctly
    expect(Stream).toHaveBeenCalledWith(mockOrigin, { token: mockToken });
    expect(mockStream.useChannel).toHaveBeenCalledWith("userList", {
      listId: mockListId,
    });

    // Check if notes were updated
    expect(result.current.notes).toEqual(mockNotes);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle invalid configuration", async () => {
    const { result } = renderHook(() =>
      useListTimeline("", mockToken, mockListId),
    );

    expect(result.current.error?.message).toBe(
      "設定に問題があります: サーバー情報が不足しています。",
    );
  });

  it("should handle missing token", async () => {
    const { result } = renderHook(() =>
      useListTimeline(mockOrigin, "", mockListId),
    );

    expect(result.current.error?.message).toBe(
      "設定に問題があります: 認証情報が不足しています。",
    );
  });

  it("should handle missing listId", async () => {
    const { result } = renderHook(() =>
      useListTimeline(mockOrigin, mockToken, ""),
    );

    expect(result.current.error?.message).toBe(
      "設定に問題があります: リストIDが設定されていません。",
    );
  });

  it("should handle API errors", async () => {
    const mockError = new Error("API Error");
    mockRequest.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() =>
      useListTimeline(mockOrigin, mockToken, mockListId),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle Misskey API specific errors", async () => {
    const mockError = { code: "NO_SUCH_LIST", message: "List not found" };
    mockRequest.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() =>
      useListTimeline(mockOrigin, mockToken, mockListId),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error?.message).toBe(
      "The specified list does not exist.",
    );
  });

  it("should handle WebSocket disconnection", async () => {
    mockRequest.mockResolvedValueOnce([]);

    const { result } = renderHook(() =>
      useListTimeline(mockOrigin, mockToken, mockListId),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Simulate WebSocket disconnection
    act(() => {
      const disconnectCallback = mockStream.on.mock.calls.find(
        (call) => call[0] === "_disconnected_",
      )?.[1];
      if (disconnectCallback) {
        disconnectCallback();
      }
    });

    expect(result.current.error?.message).toBe(
      `Connection lost to ${mockOrigin}. Timeline updates may be delayed.`,
    );
  });

  it("should handle new notes from WebSocket", async () => {
    const mockNotes = [{ id: "1", text: "Initial note" }];
    const mockNewNote = { id: "2", text: "New note" };
    mockRequest.mockResolvedValueOnce(mockNotes);

    const { result } = renderHook(() =>
      useListTimeline(mockOrigin, mockToken, mockListId),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Simulate new note from WebSocket
    act(() => {
      const noteCallback = mockChannel.on.mock.calls.find(
        (call) => call[0] === "note",
      )?.[1];
      if (noteCallback) {
        noteCallback(mockNewNote);
      }
    });

    expect(result.current.notes).toEqual([mockNewNote, ...mockNotes]);
  });

  it("should handle pagination correctly", async () => {
    const initialNotes = [{ id: "1", text: "Note 1" }];
    const moreNotes = [{ id: "2", text: "Note 2" }];
    mockRequest
      .mockResolvedValueOnce(initialNotes)
      .mockResolvedValueOnce(moreNotes);

    const { result } = renderHook(() =>
      useListTimeline(mockOrigin, mockToken, mockListId),
    );

    // Wait for initial fetch
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Fetch more notes
    await act(async () => {
      await result.current.fetchNotes(initialNotes[0].id);
    });

    expect(mockRequest).toHaveBeenCalledWith("notes/user-list-timeline", {
      listId: mockListId,
      untilId: initialNotes[0].id,
    });
    expect(result.current.notes).toEqual([...initialNotes, ...moreNotes]);
  });

  it("should handle empty response for pagination", async () => {
    const initialNotes = [{ id: "1", text: "Note 1" }];
    mockRequest.mockResolvedValueOnce(initialNotes).mockResolvedValueOnce([]);

    const { result } = renderHook(() =>
      useListTimeline(mockOrigin, mockToken, mockListId),
    );

    // Wait for initial fetch
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Fetch more notes
    await act(async () => {
      await result.current.fetchNotes(initialNotes[0].id);
    });

    expect(result.current.hasMore).toBe(false);
    expect(result.current.notes).toEqual(initialNotes);
  });

  it("should handle retryFetch", async () => {
    const mockNotes = [{ id: "1", text: "Test note" }];

    // First call succeeds, then we retry
    mockRequest.mockResolvedValueOnce(mockNotes);
    mockRequest.mockResolvedValueOnce(mockNotes);

    const { result } = renderHook(() =>
      useListTimeline(mockOrigin, mockToken, mockListId),
    );

    // Wait for initial fetch
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Reset and retry
    await act(async () => {
      result.current.retryFetch();
    });

    // Wait for retry fetch to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBeNull();
    expect(result.current.notes).toEqual(mockNotes);
    expect(result.current.hasMore).toBe(true);
  });
});
