import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StorageProvider, useStorage } from "./context";
import type { MisskeyServerConnection, TimelineConfig } from "./types";

// Mock the storage manager
vi.mock("./index", () => ({
  storageManager: {
    initialize: vi.fn(),
    getAllServers: vi.fn(),
    getAllTimelines: vi.fn(),
    getAuthState: vi.fn(),
    getAppSettings: vi.fn(),
    addServer: vi.fn(),
    updateServer: vi.fn(),
    deleteServer: vi.fn(),
    setAuthState: vi.fn(),
    addTimeline: vi.fn(),
    updateTimeline: vi.fn(),
    deleteTimeline: vi.fn(),
    reorderTimelines: vi.fn(),
    reset: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <StorageProvider>{children}</StorageProvider>
    </QueryClientProvider>
  );
};

describe("StorageContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize storage and load data successfully", async () => {
      const { storageManager } = await import("./index");
      const mockServers: MisskeyServerConnection[] = [
        {
          id: "server-1",
          origin: "https://test1.com",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockTimelines: TimelineConfig[] = [
        {
          id: "timeline-1",
          name: "Test Timeline",
          serverId: "server-1",
          type: "home",
          order: 0,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockAuthState = {
        currentServerId: "server-1",
        servers: mockServers,
        timelines: mockTimelines,
        lastUpdated: new Date(),
      };

      vi.mocked(storageManager.initialize).mockResolvedValue();
      vi.mocked(storageManager.getAllServers).mockResolvedValue(mockServers);
      vi.mocked(storageManager.getAllTimelines).mockResolvedValue(
        mockTimelines,
      );
      vi.mocked(storageManager.getAuthState).mockResolvedValue(mockAuthState);
      vi.mocked(storageManager.getAppSettings).mockResolvedValue(undefined);

      const { result } = renderHook(() => useStorage(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.servers).toEqual(mockServers);
      expect(result.current.timelines).toEqual(mockTimelines);
      expect(result.current.currentServerId).toBe("server-1");
      expect(result.current.error).toBeUndefined();
    });

    it("should handle initialization errors", async () => {
      const { storageManager } = await import("./index");
      vi.mocked(storageManager.initialize).mockRejectedValue(
        new Error("Initialization failed"),
      );

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { result } = renderHook(() => useStorage(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("Failed to initialize storage");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to initialize storage:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should handle data loading errors during refresh", async () => {
      const { storageManager } = await import("./index");
      vi.mocked(storageManager.initialize).mockResolvedValue();
      vi.mocked(storageManager.getAllServers).mockResolvedValue([]);
      vi.mocked(storageManager.getAllTimelines).mockResolvedValue([]);
      vi.mocked(storageManager.getAuthState).mockResolvedValue(undefined);
      vi.mocked(storageManager.getAppSettings).mockResolvedValue(undefined);

      const { result } = renderHook(() => useStorage(), {
        wrapper: createWrapper(),
      });

      // Wait for initial initialization to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify successful initialization
      expect(result.current.error).toBeUndefined();

      // Now mock getAllServers to fail for the refresh call
      vi.mocked(storageManager.getAllServers).mockRejectedValue(
        new Error("Failed to load servers"),
      );

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Trigger refresh to test data loading error handling
      // Since withErrorHandling might trigger reinitializeStorage, we expect "Failed to initialize storage"
      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // The actual error message may be "Failed to initialize storage" due to reinitializeStorage
      expect(result.current.error).toBe("Failed to initialize storage");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load storage data:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Server Operations", () => {
    beforeEach(async () => {
      const { storageManager } = await import("./index");
      vi.mocked(storageManager.initialize).mockResolvedValue();
      vi.mocked(storageManager.getAllServers).mockResolvedValue([]);
      vi.mocked(storageManager.getAllTimelines).mockResolvedValue([]);
      vi.mocked(storageManager.getAuthState).mockResolvedValue(undefined);
      vi.mocked(storageManager.getAppSettings).mockResolvedValue(undefined);
      vi.mocked(storageManager.setAuthState).mockResolvedValue();
    });

    it("should add a server successfully", async () => {
      const { storageManager } = await import("./index");
      const newServer: MisskeyServerConnection = {
        id: "new-server",
        origin: "https://new.com",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storageManager.addServer).mockResolvedValue(newServer);

      const { result } = renderHook(() => useStorage(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const serverData = { origin: "https://new.com", isActive: true };

      await act(async () => {
        await result.current.addServer(serverData);
      });

      expect(storageManager.addServer).toHaveBeenCalledWith(serverData);
      expect(result.current.servers).toContainEqual(newServer);
    });

    it("should update a server successfully", async () => {
      const { storageManager } = await import("./index");
      const existingServer: MisskeyServerConnection = {
        id: "server-1",
        origin: "https://test.com",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storageManager.getAllServers).mockResolvedValue([
        existingServer,
      ]);
      vi.mocked(storageManager.updateServer).mockResolvedValue();

      const { result } = renderHook(() => useStorage(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { isActive: false };

      await act(async () => {
        await result.current.updateServer("server-1", updates);
      });

      expect(storageManager.updateServer).toHaveBeenCalledWith(
        "server-1",
        updates,
      );
      expect(result.current.servers[0].isActive).toBe(false);
    });

    it("should delete a server and associated timelines", async () => {
      const { storageManager } = await import("./index");
      const server: MisskeyServerConnection = {
        id: "server-1",
        origin: "https://test.com",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const timeline: TimelineConfig = {
        id: "timeline-1",
        name: "Test Timeline",
        serverId: "server-1",
        type: "home",
        order: 0,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storageManager.getAllServers).mockResolvedValue([server]);
      vi.mocked(storageManager.getAllTimelines).mockResolvedValue([timeline]);
      vi.mocked(storageManager.getAuthState).mockResolvedValue({
        currentServerId: "server-1",
        servers: [server],
        timelines: [timeline],
        lastUpdated: new Date(),
      });
      vi.mocked(storageManager.deleteServer).mockResolvedValue();

      const { result } = renderHook(() => useStorage(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentServerId).toBe("server-1");

      await act(async () => {
        await result.current.deleteServer("server-1");
      });

      expect(storageManager.deleteServer).toHaveBeenCalledWith("server-1");
      expect(result.current.servers).toHaveLength(0);
      expect(result.current.timelines).toHaveLength(0);
      expect(result.current.currentServerId).toBeUndefined();
    });

    it("should set current server", async () => {
      const { storageManager } = await import("./index");

      const { result } = renderHook(() => useStorage(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setCurrentServer("server-2");
      });

      expect(result.current.currentServerId).toBe("server-2");
      expect(storageManager.setAuthState).toHaveBeenCalledWith(
        expect.objectContaining({ currentServerId: "server-2" }),
      );
    });
  });

  describe("Timeline Operations", () => {
    beforeEach(async () => {
      const { storageManager } = await import("./index");
      vi.mocked(storageManager.initialize).mockResolvedValue();
      vi.mocked(storageManager.getAllServers).mockResolvedValue([]);
      vi.mocked(storageManager.getAllTimelines).mockResolvedValue([]);
      vi.mocked(storageManager.getAuthState).mockResolvedValue(undefined);
      vi.mocked(storageManager.getAppSettings).mockResolvedValue(undefined);
      vi.mocked(storageManager.setAuthState).mockResolvedValue();
    });

    it("should add a timeline successfully", async () => {
      const { storageManager } = await import("./index");
      const newTimeline: TimelineConfig = {
        id: "new-timeline",
        name: "New Timeline",
        serverId: "server-1",
        type: "home",
        order: 0,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storageManager.addTimeline).mockResolvedValue(newTimeline);

      const { result } = renderHook(() => useStorage(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const timelineData = {
        name: "New Timeline",
        serverId: "server-1",
        type: "home" as const,
        order: 0,
        isVisible: true,
      };

      await act(async () => {
        await result.current.addTimeline(timelineData);
      });

      expect(storageManager.addTimeline).toHaveBeenCalledWith(timelineData);
      expect(result.current.timelines).toContainEqual(newTimeline);
    });

    it("should reorder timelines successfully", async () => {
      const { storageManager } = await import("./index");
      const timeline1: TimelineConfig = {
        id: "timeline-1",
        name: "Timeline 1",
        serverId: "server-1",
        type: "home",
        order: 0,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const timeline2: TimelineConfig = {
        id: "timeline-2",
        name: "Timeline 2",
        serverId: "server-1",
        type: "local",
        order: 1,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storageManager.getAllTimelines).mockResolvedValue([
        timeline1,
        timeline2,
      ]);
      vi.mocked(storageManager.reorderTimelines).mockResolvedValue();

      const { result } = renderHook(() => useStorage(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newOrder = ["timeline-2", "timeline-1"];

      await act(async () => {
        await result.current.reorderTimelines(newOrder);
      });

      expect(storageManager.reorderTimelines).toHaveBeenCalledWith(newOrder);
      expect(result.current.timelines[0].order).toBe(0); // timeline-2
      expect(result.current.timelines[1].order).toBe(1); // timeline-1
    });

    it("should delete a timeline successfully", async () => {
      const { storageManager } = await import("./index");
      const timeline: TimelineConfig = {
        id: "timeline-1",
        name: "Test Timeline",
        serverId: "server-1",
        type: "home",
        order: 0,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storageManager.getAllTimelines).mockResolvedValue([timeline]);
      vi.mocked(storageManager.deleteTimeline).mockResolvedValue();

      const { result } = renderHook(() => useStorage(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteTimeline("timeline-1");
      });

      expect(storageManager.deleteTimeline).toHaveBeenCalledWith("timeline-1");
      expect(result.current.timelines).toHaveLength(0);
    });
  });

  describe("Error Handling", () => {
    it("should throw error when useStorage is used outside StorageProvider", () => {
      expect(() => {
        renderHook(() => useStorage());
      }).toThrow("useStorage must be used within a StorageProvider");
    });
  });

  describe("Refresh Functionality", () => {
    it("should refresh data successfully", async () => {
      const { storageManager } = await import("./index");
      const mockServers: MisskeyServerConnection[] = [
        {
          id: "server-1",
          origin: "https://test.com",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(storageManager.initialize).mockResolvedValue();
      vi.mocked(storageManager.getAllServers)
        .mockResolvedValueOnce([]) // Initial load
        .mockResolvedValueOnce(mockServers); // After refresh
      vi.mocked(storageManager.getAllTimelines).mockResolvedValue([]);
      vi.mocked(storageManager.getAuthState).mockResolvedValue(undefined);
      vi.mocked(storageManager.getAppSettings).mockResolvedValue(undefined);

      const { result } = renderHook(() => useStorage(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.servers).toHaveLength(0);

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.servers).toEqual(mockServers);
    });
  });
});
