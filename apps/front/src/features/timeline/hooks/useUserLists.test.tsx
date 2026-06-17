import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { APIClient } from "misskey-js/api.js";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { useUserLists } from "./useUserLists";

vi.mock("misskey-js/api.js", () => ({
  APIClient: vi.fn(),
}));

describe("useUserLists", () => {
  const mockOrigin = "https://example.com";
  const mockToken = "test-token";
  let queryClient: QueryClient;

  const mockRequest = vi.fn();
  (APIClient as Mock).mockImplementation(() => ({
    request: mockRequest,
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest.mockReset();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const waitForSuccess = async (result: {
    current: { isLoading: boolean };
  }): Promise<void> => {
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  };

  const waitForError = async (result: {
    current: { error: Error | null };
  }): Promise<void> => {
    await waitFor(
      () => {
        expect(result.current.error).not.toBeNull();
      },
      { timeout: 4000 },
    );
  };

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

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken), {
      wrapper,
    });

    expect(result.current.lists).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitForSuccess(result);

    expect(APIClient).toHaveBeenCalledWith({
      origin: mockOrigin,
      credential: mockToken,
    });
    expect(mockRequest).toHaveBeenCalledWith("users/lists/list", {});
    expect(result.current.lists).toEqual(mockLists);
    expect(result.current.error).toBeNull();
  });

  it("should handle invalid configuration - missing origin", async () => {
    const { result } = renderHook(() => useUserLists("", mockToken), {
      wrapper,
    });

    expect(result.current.error?.message).toBe(
      "サーバーまたは認証情報が設定されていません。",
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle invalid configuration - missing token", async () => {
    const { result } = renderHook(() => useUserLists(mockOrigin, ""), {
      wrapper,
    });

    expect(result.current.error?.message).toBe(
      "サーバーまたは認証情報が設定されていません。",
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle API errors", async () => {
    mockRequest.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken), {
      wrapper,
    });

    await waitForError(result);

    expect(result.current.error?.message).toBe("Network error");
    expect(result.current.lists).toEqual([]);
  });

  it("should handle network errors", async () => {
    mockRequest.mockRejectedValue(new Error("NetworkError: fetch failed"));

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken), {
      wrapper,
    });

    await waitForError(result);

    expect(result.current.error?.message).toBe(
      `Network error: Unable to connect to ${mockOrigin}`,
    );
  });

  it("should handle timeout errors", async () => {
    mockRequest.mockRejectedValue(new Error("timeout"));

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken), {
      wrapper,
    });

    await waitForError(result);

    expect(result.current.error?.message).toBe(
      `Timeout error: ${mockOrigin} is taking too long to respond`,
    );
  });

  it("should handle authentication errors", async () => {
    mockRequest.mockRejectedValue(new Error("401 Unauthorized"));

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken), {
      wrapper,
    });

    await waitForError(result);

    expect(result.current.error?.message).toBe(
      "Authentication failed. Please re-login.",
    );
  });

  it("should handle Misskey API specific errors", async () => {
    mockRequest.mockRejectedValue({
      code: "INVALID_TOKEN",
      message: "Invalid token",
    });

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken), {
      wrapper,
    });

    await waitForError(result);

    expect(result.current.error?.message).toBe(
      "Invalid token. Please re-authenticate.",
    );
  });

  it("should handle rate limit errors", async () => {
    mockRequest.mockRejectedValue({ code: "RATE_LIMIT_EXCEEDED" });

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken), {
      wrapper,
    });

    await waitForError(result);

    expect(result.current.error?.message).toBe(
      "Rate limit exceeded. Please wait before trying again.",
    );
  });

  it("should handle invalid response format", async () => {
    mockRequest.mockResolvedValue("invalid response");

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken), {
      wrapper,
    });

    await waitForError(result);

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

    mockRequest
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken), {
      wrapper,
    });

    await waitForError(result);
    expect(result.current.error?.message).toBe("Network error");

    mockRequest.mockResolvedValueOnce(mockLists);

    await act(async () => {
      result.current.retryFetch();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.lists).toEqual(mockLists);
    });
  });

  it("should handle empty lists response", async () => {
    mockRequest.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useUserLists(mockOrigin, mockToken), {
      wrapper,
    });

    await waitForSuccess(result);

    expect(result.current.lists).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should not fetch when configuration is invalid", async () => {
    const { result } = renderHook(() => useUserLists("", ""), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRequest).not.toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
  });
});
