import { beforeEach, describe, expect, it, vi } from "vitest";
import { storageManager } from "./index";
import type { MisskeyServerConnection, TimelineConfig } from "./types";

// Mock the database and localStorage managers
vi.mock("./database", () => ({
  databaseManager: {
    initialize: vi.fn(),
    addServer: vi.fn(),
    getServer: vi.fn(),
    getAllServers: vi.fn(),
    updateServer: vi.fn(),
    deleteServer: vi.fn(),
    addTimeline: vi.fn(),
    getTimeline: vi.fn(),
    getTimelinesByServer: vi.fn(),
    getAllTimelines: vi.fn(),
    updateTimeline: vi.fn(),
    deleteTimeline: vi.fn(),
    reorderTimelines: vi.fn(),
    getAuthState: vi.fn(),
    setAuthState: vi.fn(),
    clearAuthState: vi.fn(),
  },
}));

vi.mock("./localStorage", () => ({
  localStorageManager: {
    addServer: vi.fn(),
    getServer: vi.fn(),
    getAllServers: vi.fn(),
    updateServer: vi.fn(),
    deleteServer: vi.fn(),
    addTimeline: vi.fn(),
    getTimeline: vi.fn(),
    getTimelinesByServer: vi.fn(),
    getAllTimelines: vi.fn(),
    updateTimeline: vi.fn(),
    deleteTimeline: vi.fn(),
    reorderTimelines: vi.fn(),
    getAuthState: vi.fn(),
    setAuthState: vi.fn(),
    clearAuthState: vi.fn(),
  },
}));

describe("StorageManager", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset the initialized state for each test
    (storageManager as any).initialized = false;
  });

  describe("Initialization", () => {
    it("should initialize with IndexedDB when available", async () => {
      const { databaseManager } = await import("./database");
      vi.mocked(databaseManager.initialize).mockResolvedValue();

      await storageManager.initialize();

      expect(databaseManager.initialize).toHaveBeenCalled();
    });

    it("should fallback to localStorage when IndexedDB fails", async () => {
      const { databaseManager } = await import("./database");
      vi.mocked(databaseManager.initialize).mockRejectedValue(
        new Error("IndexedDB not available"),
      );

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await storageManager.initialize();

      expect(databaseManager.initialize).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        "IndexedDB not available, falling back to localStorage:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should only initialize once", async () => {
      const { databaseManager } = await import("./database");
      vi.mocked(databaseManager.initialize).mockResolvedValue();

      await storageManager.initialize();
      await storageManager.initialize(); // Second call

      expect(databaseManager.initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling for Uninitialized Storage", () => {
    const testMethods = [
      ["addServer", [{ origin: "test", isActive: true }]],
      ["getServer", ["test-id"]],
      ["getAllServers", []],
      ["updateServer", ["test-id", { isActive: false }]],
      ["deleteServer", ["test-id"]],
      [
        "addTimeline",
        [
          {
            name: "test",
            serverId: "test",
            type: "home",
            order: 0,
            isVisible: true,
          },
        ],
      ],
      ["getTimeline", ["test-id"]],
      ["getTimelinesByServer", ["test-id"]],
      ["getAllTimelines", []],
      ["updateTimeline", ["test-id", { name: "updated" }]],
      ["deleteTimeline", ["test-id"]],
      ["reorderTimelines", [["id1", "id2"]]],
      ["getAuthState", []],
      [
        "setAuthState",
        [
          {
            currentServerId: "test",
            servers: [],
            timelines: [],
            lastUpdated: new Date(),
          },
        ],
      ],
      ["clearAuthState", []],
    ] as const;

    testMethods.forEach(([methodName, args]) => {
      it(`should throw error when ${methodName} is called before initialization`, async () => {
        await expect(
          (storageManager as any)[methodName](...args),
        ).rejects.toThrow("Storage not initialized. Call initialize() first.");
      });
    });
  });

  describe("Storage Operations After Initialization", () => {
    beforeEach(async () => {
      const { databaseManager } = await import("./database");
      vi.mocked(databaseManager.initialize).mockResolvedValue();
      await storageManager.initialize();
    });

    describe("Server Operations", () => {
      it("should delegate addServer to database manager", async () => {
        const { databaseManager } = await import("./database");
        const mockServer: MisskeyServerConnection = {
          id: "test-id",
          origin: "https://test.com",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        vi.mocked(databaseManager.addServer).mockResolvedValue(mockServer);

        const serverData = { origin: "https://test.com", isActive: true };
        const result = await storageManager.addServer(serverData);

        expect(databaseManager.addServer).toHaveBeenCalledWith(serverData);
        expect(result).toEqual(mockServer);
      });

      it("should delegate getServer to database manager", async () => {
        const { databaseManager } = await import("./database");
        const mockServer: MisskeyServerConnection = {
          id: "test-id",
          origin: "https://test.com",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        vi.mocked(databaseManager.getServer).mockResolvedValue(mockServer);

        const result = await storageManager.getServer("test-id");

        expect(databaseManager.getServer).toHaveBeenCalledWith("test-id");
        expect(result).toEqual(mockServer);
      });

      it("should delegate getAllServers to database manager", async () => {
        const { databaseManager } = await import("./database");
        const mockServers: MisskeyServerConnection[] = [];

        vi.mocked(databaseManager.getAllServers).mockResolvedValue(mockServers);

        const result = await storageManager.getAllServers();

        expect(databaseManager.getAllServers).toHaveBeenCalled();
        expect(result).toEqual(mockServers);
      });

      it("should delegate updateServer to database manager", async () => {
        const { databaseManager } = await import("./database");
        vi.mocked(databaseManager.updateServer).mockResolvedValue();

        const updates = { isActive: false };
        await storageManager.updateServer("test-id", updates);

        expect(databaseManager.updateServer).toHaveBeenCalledWith(
          "test-id",
          updates,
        );
      });

      it("should delegate deleteServer to database manager", async () => {
        const { databaseManager } = await import("./database");
        vi.mocked(databaseManager.deleteServer).mockResolvedValue();

        await storageManager.deleteServer("test-id");

        expect(databaseManager.deleteServer).toHaveBeenCalledWith("test-id");
      });
    });

    describe("Timeline Operations", () => {
      it("should delegate addTimeline to database manager", async () => {
        const { databaseManager } = await import("./database");
        const mockTimeline: TimelineConfig = {
          id: "test-id",
          name: "Test Timeline",
          serverId: "server-id",
          type: "home",
          order: 0,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        vi.mocked(databaseManager.addTimeline).mockResolvedValue(mockTimeline);

        const timelineData = {
          name: "Test Timeline",
          serverId: "server-id",
          type: "home" as const,
          order: 0,
          isVisible: true,
        };
        const result = await storageManager.addTimeline(timelineData);

        expect(databaseManager.addTimeline).toHaveBeenCalledWith(timelineData);
        expect(result).toEqual(mockTimeline);
      });

      it("should delegate reorderTimelines to database manager", async () => {
        const { databaseManager } = await import("./database");
        vi.mocked(databaseManager.reorderTimelines).mockResolvedValue();

        const timelineIds = ["id1", "id2", "id3"];
        await storageManager.reorderTimelines(timelineIds);

        expect(databaseManager.reorderTimelines).toHaveBeenCalledWith(
          timelineIds,
        );
      });
    });

    describe("Auth State Operations", () => {
      it("should delegate getAuthState to database manager", async () => {
        const { databaseManager } = await import("./database");
        const mockAuthState = {
          currentServerId: "test-server",
          servers: [],
          timelines: [],
          lastUpdated: new Date(),
        };

        vi.mocked(databaseManager.getAuthState).mockResolvedValue(
          mockAuthState,
        );

        const result = await storageManager.getAuthState();

        expect(databaseManager.getAuthState).toHaveBeenCalled();
        expect(result).toEqual(mockAuthState);
      });

      it("should delegate setAuthState to database manager", async () => {
        const { databaseManager } = await import("./database");
        vi.mocked(databaseManager.setAuthState).mockResolvedValue();

        const authState = {
          currentServerId: "test-server",
          servers: [],
          timelines: [],
          lastUpdated: new Date(),
        };
        await storageManager.setAuthState(authState);

        expect(databaseManager.setAuthState).toHaveBeenCalledWith(authState);
      });

      it("should delegate clearAuthState to database manager", async () => {
        const { databaseManager } = await import("./database");
        vi.mocked(databaseManager.clearAuthState).mockResolvedValue();

        await storageManager.clearAuthState();

        expect(databaseManager.clearAuthState).toHaveBeenCalled();
      });
    });
  });

  describe("Fallback to localStorage", () => {
    beforeEach(async () => {
      const { databaseManager } = await import("./database");
      vi.mocked(databaseManager.initialize).mockRejectedValue(
        new Error("IndexedDB not available"),
      );

      // Suppress console.warn for cleaner test output
      vi.spyOn(console, "warn").mockImplementation(() => {});

      await storageManager.initialize();
    });

    it("should use localStorage when IndexedDB fails", async () => {
      const { localStorageManager } = await import("./localStorage");
      const mockServer: MisskeyServerConnection = {
        id: "test-id",
        origin: "https://test.com",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(localStorageManager.addServer).mockResolvedValue(mockServer);

      const serverData = { origin: "https://test.com", isActive: true };
      const result = await storageManager.addServer(serverData);

      expect(localStorageManager.addServer).toHaveBeenCalledWith(serverData);
      expect(result).toEqual(mockServer);
    });
  });
});
