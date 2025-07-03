import { act, renderHook } from "@testing-library/react";
import { Stream } from "misskey-js";
import { APIClient } from "misskey-js/api.js";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { useTimeline } from "./useTimeline";

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

describe("useTimeline", () => {
  const mockOrigin = "https://example.com";
  const mockToken = "test-token";
  const mockType = "home" as const;

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
      useTimeline(mockOrigin, mockToken, mockType),
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
    expect(mockRequest).toHaveBeenCalledWith("notes/timeline", {});

    // Check if Stream was setup correctly
    expect(Stream).toHaveBeenCalledWith(mockOrigin, { token: mockToken });
    expect(mockStream.useChannel).toHaveBeenCalledWith("homeTimeline");

    // Check if notes were updated
    expect(result.current.notes).toEqual(mockNotes);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle API errors", async () => {
    const mockError = new Error("API Error");
    mockRequest.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() =>
      useTimeline(mockOrigin, mockToken, mockType),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle WebSocket disconnection", async () => {
    mockRequest.mockResolvedValueOnce([]);

    const { result } = renderHook(() =>
      useTimeline(mockOrigin, mockToken, mockType),
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
      useTimeline(mockOrigin, mockToken, mockType),
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
      useTimeline(mockOrigin, mockToken, mockType),
    );

    // Wait for initial fetch
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Fetch more notes
    await act(async () => {
      await result.current.fetchNotes(initialNotes[0].id);
    });

    expect(mockRequest).toHaveBeenCalledWith("notes/timeline", {
      untilId: initialNotes[0].id,
    });
    expect(result.current.notes).toEqual([...initialNotes, ...moreNotes]);
  });

  it("should handle empty response for pagination", async () => {
    const initialNotes = [{ id: "1", text: "Note 1" }];
    mockRequest.mockResolvedValueOnce(initialNotes).mockResolvedValueOnce([]);

    const { result } = renderHook(() =>
      useTimeline(mockOrigin, mockToken, mockType),
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
});
