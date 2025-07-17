import { renderHook, waitFor } from "@testing-library/react";
import { APIClient } from "misskey-js/api.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUserTimeline } from "./useUserTimeline";

// Mock misskey-js
vi.mock("misskey-js/api.js", () => ({
  // biome-ignore lint/style/useNamingConvention: External API class name
  APIClient: vi.fn(),
}));

describe("useUserTimeline", () => {
  const mockRequest = vi.fn();
  const mockApiClient = {
    request: mockRequest,
    origin: "https://example.com",
    credential: "token",
    fetch: vi.fn(),
  } as unknown as APIClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest.mockClear();
    vi.mocked(APIClient).mockImplementation(() => mockApiClient);
  });

  it("should initialize with correct default values", async () => {
    mockRequest.mockResolvedValueOnce([]);

    const { result } = renderHook(() =>
      useUserTimeline("https://example.com", "token", "user123"),
    );

    expect(result.current.notes).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBe(true);

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should set error when config is invalid", () => {
    const { result } = renderHook(() => useUserTimeline("", "", ""));

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain(
      "サーバー、認証情報、またはユーザーIDが設定されていません",
    );
  });

  it("should fetch user notes successfully", async () => {
    const mockNotes = [
      { id: "1", text: "Test note 1" },
      { id: "2", text: "Test note 2" },
    ];

    mockRequest.mockResolvedValueOnce(mockNotes);

    const { result } = renderHook(() =>
      useUserTimeline("https://example.com", "token", "user123"),
    );

    await waitFor(() => {
      expect(result.current.notes).toEqual(mockNotes);
    });

    expect(mockRequest).toHaveBeenCalledWith("users/notes", {
      userId: "user123",
      limit: 20,
    });
  });

  it("should handle API errors gracefully", async () => {
    const errorMessage = "API Error";
    mockRequest.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() =>
      useUserTimeline("https://example.com", "token", "user123"),
    );

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe(errorMessage);
    });
  });

  it("should handle pagination with untilId", async () => {
    const mockNotes = [{ id: "3", text: "Test note 3" }];

    mockRequest.mockResolvedValueOnce(mockNotes);

    const { result } = renderHook(() =>
      useUserTimeline("https://example.com", "token", "user123"),
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock initial notes for loadMore
    (result.current.notes as { id: string; text: string }[]).push({
      id: "1",
      text: "Test note 1",
    });

    // Test loadMore
    result.current.loadMore();

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith("users/notes", {
        userId: "user123",
        limit: 20,
        untilId: "1",
      });
    });
  });

  it("should handle retry functionality", async () => {
    const mockNotes = [{ id: "1", text: "Test note 1" }];

    // First call fails
    mockRequest.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() =>
      useUserTimeline("https://example.com", "token", "user123"),
    );

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    // Second call succeeds
    mockRequest.mockResolvedValueOnce(mockNotes);

    result.current.retryFetch();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.notes).toEqual(mockNotes);
    });
  });
});
