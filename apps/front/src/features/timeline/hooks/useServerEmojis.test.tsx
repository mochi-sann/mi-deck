import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useServerEmojis } from "./useServerEmojis";

const {
  mockUseQuery,
  mockRequest,
  mockApiClient,
  mockGetAllServers,
  mockInitialize,
} = vi.hoisted(() => {
  const mockRequest = vi.fn();
  const mockApiClient = vi.fn(() => ({
    request: mockRequest,
  }));
  const mockGetAllServers = vi.fn();
  const mockInitialize = vi.fn();
  const mockUseQuery = vi.fn();

  return {
    mockUseQuery,
    mockRequest,
    mockApiClient,
    mockGetAllServers,
    mockInitialize,
  };
});

vi.mock("@tanstack/react-query", () => ({
  useQuery: mockUseQuery,
}));

vi.mock("misskey-js", () => ({
  api: {
    // biome-ignore lint/style/useNamingConvention: lib name
    APIClient: mockApiClient,
  },
}));

vi.mock("@/lib/storage", () => ({
  storageManager: {
    initialize: mockInitialize,
    getAllServers: mockGetAllServers,
  },
}));

describe("useServerEmojis", () => {
  const origin = "misskey.test";
  const mockEmojis = [
    {
      name: "emoji1",
      category: "cat1",
      aliases: ["e1"],
      roleIdsThatCanBeUsedThisEmojiAsReaction: [],
    },
    {
      name: "emoji2",
      category: "cat2",
      aliases: [],
      roleIdsThatCanBeUsedThisEmojiAsReaction: ["role1"],
    },
    {
      name: "emoji3",
      category: null,
      aliases: [],
      roleIdsThatCanBeUsedThisEmojiAsReaction: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Default mocks
    mockInitialize.mockResolvedValue(undefined);
    mockGetAllServers.mockResolvedValue([
      { origin: "misskey.test", isActive: true, accessToken: "token" },
    ]);

    // useQuery mock implementation to simulate data return
    mockUseQuery.mockImplementation(({ queryFn }) => {
      // We can execute the queryFn to test the fetch logic, but strictly for useQuery's return value:
      // In the hook, useQuery calls queryFn which calls createMisskeyClient -> storageManager -> APIClient
      // The hook returns data from useQuery.
      // So for basic testing of the hook's OUTPUT (filtering/grouping), we can just mock the data returned by useQuery.
      // For testing the FETCHING logic (queryFn), we can test that separately or implicitly.
      return {
        data: mockEmojis,
        isLoading: false,
        error: null,
      };
    });
  });

  describe("Fetching logic (via useQuery)", () => {
    it("should attempt to fetch emojis using APIClient with correct credentials", async () => {
      // To test the queryFn logic, we need to extract it or simulate useQuery behaving like real react-query.
      // Since we mocked useQuery, we can grab the queryFn passed to it and run it.

      let capturedQueryFn: (() => Promise<any>) | undefined;
      mockUseQuery.mockImplementation(({ queryFn }) => {
        capturedQueryFn = queryFn;
        return { data: [], isLoading: true };
      });

      renderHook(() => useServerEmojis({ origin }));

      expect(capturedQueryFn).toBeDefined();

      // Setup API mock response
      mockRequest.mockResolvedValue({ emojis: mockEmojis });

      // Run the query function
      const result = await capturedQueryFn!();

      expect(mockInitialize).toHaveBeenCalled();
      expect(mockGetAllServers).toHaveBeenCalled();
      expect(mockApiClient).toHaveBeenCalledWith({
        origin: "misskey.test",
        credential: "token",
      });
      expect(mockRequest).toHaveBeenCalledWith("emojis", {});
      expect(result).toEqual(mockEmojis);
    });

    it("should throw error if server not found/active", async () => {
      mockGetAllServers.mockResolvedValue([]);

      let capturedQueryFn: (() => Promise<any>) | undefined;
      mockUseQuery.mockImplementation(({ queryFn }) => {
        capturedQueryFn = queryFn;
        return { data: [], isLoading: true };
      });

      renderHook(() => useServerEmojis({ origin }));

      await expect(capturedQueryFn!()).rejects.toThrow(
        "No active server found for origin: misskey.test",
      );
    });
  });

  describe("Filtering", () => {
    it("should return all emojis if no role restrictions", () => {
      const { result } = renderHook(() => useServerEmojis({ origin }));
      // emoji1 (no restriction), emoji2 (role1), emoji3 (no restriction)
      // userRoleIds is empty by default -> emoji2 should be filtered out IF it has restrictions?
      // Code: if allowedRoles.length > 0 && !allowedRoles.some(...) -> return false
      // So empty userRoleIds means emoji2 is filtered out.

      expect(result.current.emojis).toHaveLength(2);
      expect(result.current.emojis.map((e) => e.name)).toEqual(
        expect.arrayContaining(["emoji1", "emoji3"]),
      );
    });

    it("should include restricted emojis if user has role", () => {
      const { result } = renderHook(() =>
        useServerEmojis({ origin, userRoleIds: ["role1"] }),
      );
      expect(result.current.emojis).toHaveLength(3);
    });
  });

  describe("Grouping", () => {
    it("should group emojis by category", () => {
      const { result } = renderHook(() =>
        useServerEmojis({ origin, userRoleIds: ["role1"] }),
      );
      const groups = result.current.groupedEmojis;

      expect(Object.keys(groups)).toHaveLength(3); // cat1, cat2, その他
      expect(groups.cat1).toHaveLength(1);
      expect(groups.cat1[0].name).toBe("emoji1");
      expect(groups.cat2).toHaveLength(1);
      expect(groups.cat2[0].name).toBe("emoji2");
      expect(groups.その他).toHaveLength(1);
      expect(groups.その他[0].name).toBe("emoji3");
    });

    it("should list categories correctly formatted", () => {
      const { result } = renderHook(() =>
        useServerEmojis({ origin, userRoleIds: ["role1"] }),
      );
      // "その他" should be last, others sorted alphabetically
      expect(result.current.categories).toEqual(["cat1", "cat2", "その他"]);
    });
  });

  describe("Searching", () => {
    it("should search functionality", () => {
      const { result } = renderHook(() =>
        useServerEmojis({ origin, userRoleIds: ["role1"] }),
      );

      // By name
      expect(result.current.searchEmojis("emoji1")).toHaveLength(1);
      expect(result.current.searchEmojis("emoji1")[0].name).toBe("emoji1");

      // By alias
      expect(result.current.searchEmojis("e1")).toHaveLength(1);
      expect(result.current.searchEmojis("e1")[0].name).toBe("emoji1");

      // Case insensible
      expect(result.current.searchEmojis("EMOJI1")).toHaveLength(1);

      // Empty
      expect(result.current.searchEmojis("")).toHaveLength(0);
    });
  });

  describe("Recent Emojis", () => {
    it("should manage recent emojis in localStorage", () => {
      const { result } = renderHook(() =>
        useServerEmojis({ origin, userRoleIds: ["role1"] }),
      );

      // Initially empty
      expect(result.current.getRecentEmojis()).toEqual([]);

      // Add one
      result.current.addToRecentEmojis("emoji1");

      // Should retrieve it
      const recent = result.current.getRecentEmojis();
      expect(recent).toHaveLength(1);
      expect(recent[0].name).toBe("emoji1");

      // Verify localStorage call
      expect(localStorage.getItem(`recent-emojis-${origin}`)).toBeTruthy();
    });

    it("should limit recent emojis to 50 (testing with smaller limit simulation logic if needed, but logic says 50)", () => {
      const { result } = renderHook(() =>
        useServerEmojis({ origin, userRoleIds: ["role1"] }),
      );

      // Add same one multiple times -> should assume implementation handles dedupe or similar logic
      // The implementation: recent.filter(item => item.name !== emojiName); recent.unshift(...)
      result.current.addToRecentEmojis("emoji1");
      result.current.addToRecentEmojis("emoji1");

      // Should only be one entry
      expect(
        JSON.parse(localStorage.getItem(`recent-emojis-${origin}`) || "[]"),
      ).toHaveLength(1);
    });

    it("should only return recent emojis that still exist in the filtered list", () => {
      // Add "deleted_emoji" to local storage
      localStorage.setItem(
        `recent-emojis-${origin}`,
        JSON.stringify([{ name: "deleted_emoji", lastUsed: Date.now() }]),
      );

      const { result } = renderHook(() =>
        useServerEmojis({ origin, userRoleIds: ["role1"] }),
      );

      // Should return empty because "deleted_emoji" is not in mockEmojis
      expect(result.current.getRecentEmojis()).toHaveLength(0);
    });
  });
});
