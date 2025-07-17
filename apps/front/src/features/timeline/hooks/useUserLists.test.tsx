import { act, renderHook } from "@testing-library/react";
import { APIClient } from "misskey-js/api.js";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { useUserLists } from "./useUserLists";

// Mock misskey-js modules
vi.mock("misskey-js/api.js", () => ({
  // biome-ignore lint/style/useNamingConvention: misskey-js API class naming
  APIClient: vi.fn(),
}));

describe("useUserLists", () => {
  const mockOrigin = "https://example.com";
  const mockToken = "test-token";

  // Mock APIClient
  const mockRequest = vi.fn();
  (APIClient as Mock).mockImplementation(() => ({
    request: mockRequest,
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest.mockReset();
  });

  it("should fetch user lists successfully", async () => {
    const mockLists = [
      {
        id: "list1",
        name: "Test List 1",
        description: "First test list",
        isPublic: false,
        userIds: ["user1", "user2"],
        createdAt: "2023-01-01T00:00:00.000Z",
      },
      {
        id: "list2",
        name: "Test List 2",
        description: "Second test list",
        isPublic: true,
        userIds: ["user3"],
        createdAt: "2023-01-02T00:00:00.000Z",
      },
    ];
    mockRequest.mockResolvedValueOnce(mockLists);

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken));

    // Check initial state
    expect(result.current.lists).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(true);

    // Wait for fetch
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Check if APIClient was called correctly
    expect(APIClient).toHaveBeenCalledWith({
      origin: mockOrigin,
      credential: mockToken,
    });
    expect(mockRequest).toHaveBeenCalledWith("users/lists/list", {});

    // Check if lists were updated
    expect(result.current.lists).toEqual(mockLists);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle invalid configuration - missing origin", async () => {
    const { result } = renderHook(() => useUserLists("", mockToken));

    expect(result.current.error?.message).toBe(
      "サーバーまたは認証情報が設定されていません。",
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle invalid configuration - missing token", async () => {
    const { result } = renderHook(() => useUserLists(mockOrigin, ""));

    expect(result.current.error?.message).toBe(
      "サーバーまたは認証情報が設定されていません。",
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle API errors", async () => {
    const mockError = new Error("Network error");
    mockRequest.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.lists).toEqual([]);
  });

  it("should handle network errors", async () => {
    const mockError = new Error("NetworkError: fetch failed");
    mockRequest.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error?.message).toBe(
      `Network error: Unable to connect to ${mockOrigin}`,
    );
  });

  it("should handle timeout errors", async () => {
    const mockError = new Error("timeout");
    mockRequest.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error?.message).toBe(
      `Timeout error: ${mockOrigin} is taking too long to respond`,
    );
  });

  it("should handle authentication errors", async () => {
    const mockError = new Error("401 Unauthorized");
    mockRequest.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error?.message).toBe(
      "Authentication failed. Please re-login.",
    );
  });

  it("should handle Misskey API specific errors", async () => {
    const mockError = { code: "INVALID_TOKEN", message: "Invalid token" };
    mockRequest.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error?.message).toBe(
      "Invalid token. Please re-authenticate.",
    );
  });

  it("should handle rate limit errors", async () => {
    const mockError = { code: "RATE_LIMIT_EXCEEDED" };
    mockRequest.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error?.message).toBe(
      "Rate limit exceeded. Please wait before trying again.",
    );
  });

  it("should handle invalid response format", async () => {
    mockRequest.mockResolvedValueOnce("invalid response");

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error?.message).toBe("Invalid response format");
    expect(result.current.lists).toEqual([]);
  });

  it("should handle retryFetch", async () => {
    const mockLists = [
      {
        id: "list1",
        name: "Test List 1",
        description: "First test list",
        isPublic: false,
        userIds: ["user1"],
        createdAt: "2023-01-01T00:00:00.000Z",
      },
    ];

    // First call fails
    mockRequest.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBeTruthy();

    // Second call succeeds
    mockRequest.mockResolvedValueOnce(mockLists);

    // Retry
    await act(async () => {
      result.current.retryFetch();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.lists).toEqual(mockLists);
  });

  it("should handle empty lists response", async () => {
    mockRequest.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.lists).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("should not fetch when configuration is invalid", async () => {
    const { result } = renderHook(() => useUserLists("", ""));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockRequest).not.toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
  });
});
