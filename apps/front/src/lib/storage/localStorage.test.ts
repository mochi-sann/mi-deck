import { beforeEach, describe, expect, it, vi } from "vitest";
import { localStorageManager } from "./localStorage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("LocalStorageManager", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("Import/Export Functionality", () => {
    let testServerId: string;
    let testTimelineId: string;

    beforeEach(async () => {
      // Add test server
      const server = await localStorageManager.addServer({
        origin: "https://test.example.com",
        accessToken: "test-token",
        isActive: true,
        userInfo: {
          id: "user-123",
          username: "testuser",
          name: "Test User",
        },
        serverInfo: {
          name: "Test Server",
          version: "13.0.0",
        },
      });
      testServerId = server.id;

      // Add test timeline
      const timeline = await localStorageManager.addTimeline({
        name: "Test Timeline",
        serverId: testServerId,
        type: "home",
        order: 0,
        isVisible: true,
        settings: {
          withReplies: true,
          withFiles: false,
        },
      });
      testTimelineId = timeline.id;

      // Set test auth state
      await localStorageManager.setAuthState({
        currentServerId: testServerId,
        servers: [server],
        timelines: [timeline],
        lastUpdated: new Date(),
      });
    });

    it("should export data successfully", async () => {
      const exportedData = await localStorageManager.exportData();
      const parsed = JSON.parse(exportedData);

      expect(parsed.version).toBe(1);
      expect(parsed.exportedAt).toBeDefined();
      expect(new Date(parsed.exportedAt)).toBeInstanceOf(Date);

      expect(parsed.data.servers).toHaveLength(1);
      expect(parsed.data.servers[0].id).toBe(testServerId);
      expect(parsed.data.servers[0].origin).toBe("https://test.example.com");

      expect(parsed.data.timelines).toHaveLength(1);
      expect(parsed.data.timelines[0].id).toBe(testTimelineId);
      expect(parsed.data.timelines[0].name).toBe("Test Timeline");

      expect(parsed.data.authState).toBeDefined();
      expect(parsed.data.authState.currentServerId).toBe(testServerId);
    });

    it("should import data successfully", async () => {
      // First export data
      const exportedData = await localStorageManager.exportData();
      const parsed = JSON.parse(exportedData);

      // Store the original IDs to verify after import
      const originalServerId = parsed.data.servers[0].id;
      const originalTimelineId = parsed.data.timelines[0].id;

      // Clear all data
      await localStorageManager.clearAllData();

      // Verify data is cleared
      const serversAfterClear = await localStorageManager.getAllServers();
      const timelinesAfterClear = await localStorageManager.getAllTimelines();
      const authStateAfterClear = await localStorageManager.getAuthState();

      expect(serversAfterClear).toHaveLength(0);
      expect(timelinesAfterClear).toHaveLength(0);
      expect(authStateAfterClear).toBeUndefined();

      // Import data back
      await localStorageManager.importData(exportedData);

      // Verify data is restored
      const serversAfterImport = await localStorageManager.getAllServers();
      const timelinesAfterImport = await localStorageManager.getAllTimelines();
      const authStateAfterImport = await localStorageManager.getAuthState();

      expect(serversAfterImport).toHaveLength(1);
      expect(serversAfterImport[0].id).toBe(originalServerId);
      expect(serversAfterImport[0].origin).toBe("https://test.example.com");
      expect(serversAfterImport[0].createdAt).toBeInstanceOf(Date);
      expect(serversAfterImport[0].updatedAt).toBeInstanceOf(Date);

      expect(timelinesAfterImport).toHaveLength(1);
      expect(timelinesAfterImport[0].id).toBe(originalTimelineId);
      expect(timelinesAfterImport[0].name).toBe("Test Timeline");
      expect(timelinesAfterImport[0].createdAt).toBeInstanceOf(Date);
      expect(timelinesAfterImport[0].updatedAt).toBeInstanceOf(Date);

      expect(authStateAfterImport).toBeDefined();
      expect(authStateAfterImport?.currentServerId).toBe(originalServerId);
      expect(authStateAfterImport?.lastUpdated).toBeInstanceOf(Date);
    });

    it("should handle invalid JSON during import", async () => {
      await expect(
        localStorageManager.importData("invalid json"),
      ).rejects.toThrow("無効なJSONデータです");
    });

    it("should handle unsupported version during import", async () => {
      const invalidData = JSON.stringify({
        version: 999,
        data: {},
      });

      await expect(localStorageManager.importData(invalidData)).rejects.toThrow(
        "サポートされていないデータバージョンです",
      );
    });

    it("should handle invalid data structure during import", async () => {
      const invalidData = JSON.stringify({
        version: 1,
        // Missing data property
      });

      await expect(localStorageManager.importData(invalidData)).rejects.toThrow(
        "データ構造が無効です",
      );
    });

    it("should import empty data successfully", async () => {
      const emptyData = JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          servers: [],
          timelines: [],
          authState: null,
        },
      });

      await localStorageManager.importData(emptyData);

      const servers = await localStorageManager.getAllServers();
      const timelines = await localStorageManager.getAllTimelines();
      const authState = await localStorageManager.getAuthState();

      expect(servers).toHaveLength(0);
      expect(timelines).toHaveLength(0);
      expect(authState).toBeUndefined();
    });

    it("should clear all data successfully", async () => {
      // Verify data exists
      const serversBefore = await localStorageManager.getAllServers();
      const timelinesBefore = await localStorageManager.getAllTimelines();
      const authStateBefore = await localStorageManager.getAuthState();

      expect(serversBefore).toHaveLength(1);
      expect(timelinesBefore).toHaveLength(1);
      expect(authStateBefore).toBeDefined();

      // Clear all data
      await localStorageManager.clearAllData();

      // Verify data is cleared
      const serversAfter = await localStorageManager.getAllServers();
      const timelinesAfter = await localStorageManager.getAllTimelines();
      const authStateAfter = await localStorageManager.getAuthState();

      expect(serversAfter).toHaveLength(0);
      expect(timelinesAfter).toHaveLength(0);
      expect(authStateAfter).toBeUndefined();
    });

    it("should preserve data relationships during import/export", async () => {
      // Export data
      const exportedData = await localStorageManager.exportData();

      // Clear and import
      await localStorageManager.clearAllData();
      await localStorageManager.importData(exportedData);

      // Verify relationships
      const servers = await localStorageManager.getAllServers();
      const timelines = await localStorageManager.getAllTimelines();

      expect(timelines[0].serverId).toBe(servers[0].id);

      // Verify timeline can be retrieved by server
      const serverTimelines = await localStorageManager.getTimelinesByServer(
        servers[0].id,
      );
      expect(serverTimelines).toHaveLength(1);
      expect(serverTimelines[0].id).toBe(timelines[0].id);
    });

    it("should handle storage errors gracefully", async () => {
      // Mock localStorage to throw error when setItem is called
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn().mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      // Test with invalid JSON to ensure error is caught properly
      const testData = JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          servers: [
            {
              id: "test-id",
              origin: "https://test.com",
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          timelines: [],
          authState: null,
        },
      });

      // Since setStoredData calls localStorage.setItem, it should throw an error
      await expect(localStorageManager.importData(testData)).rejects.toThrow(
        "Storage quota exceeded",
      );

      // Restore original function
      localStorageMock.setItem = originalSetItem;
    });

    it("should export empty data when no data exists", async () => {
      // Save current data
      const currentServers = await localStorageManager.getAllServers();
      const currentTimelines = await localStorageManager.getAllTimelines();
      const currentAuthState = await localStorageManager.getAuthState();

      // Clear all data for this test
      await localStorageManager.clearAllData();

      const exportedData = await localStorageManager.exportData();
      const parsed = JSON.parse(exportedData);

      expect(parsed.version).toBe(1);
      expect(parsed.data.servers).toHaveLength(0);
      expect(parsed.data.timelines).toHaveLength(0);
      expect(parsed.data.authState).toBeNull();

      // Restore the data for other tests
      for (const server of currentServers) {
        await localStorageManager.addServer({
          origin: server.origin,
          accessToken: server.accessToken,
          isActive: server.isActive,
          userInfo: server.userInfo,
          serverInfo: server.serverInfo,
        });
      }
      for (const timeline of currentTimelines) {
        await localStorageManager.addTimeline({
          name: timeline.name,
          serverId: timeline.serverId,
          type: timeline.type,
          order: timeline.order,
          isVisible: timeline.isVisible,
          settings: timeline.settings,
        });
      }
      if (currentAuthState) {
        await localStorageManager.setAuthState(currentAuthState);
      }
    });

    it("should handle date conversion correctly", async () => {
      // Use the existing test data from beforeEach (don't clear it)
      const exportedData = await localStorageManager.exportData();
      const parsed = JSON.parse(exportedData);

      // Verify we have data to test
      expect(parsed.data.servers).toHaveLength(1);
      expect(parsed.data.timelines).toHaveLength(1);

      // Dates should be ISO strings in JSON
      expect(typeof parsed.data.servers[0].createdAt).toBe("string");
      expect(typeof parsed.data.servers[0].updatedAt).toBe("string");
      expect(typeof parsed.data.timelines[0].createdAt).toBe("string");
      expect(typeof parsed.data.timelines[0].updatedAt).toBe("string");

      // After import, they should be Date objects
      await localStorageManager.clearAllData();
      await localStorageManager.importData(exportedData);

      const servers = await localStorageManager.getAllServers();
      const timelines = await localStorageManager.getAllTimelines();

      expect(servers).toHaveLength(1);
      expect(timelines).toHaveLength(1);
      expect(servers[0].createdAt).toBeInstanceOf(Date);
      expect(servers[0].updatedAt).toBeInstanceOf(Date);
      expect(timelines[0].createdAt).toBeInstanceOf(Date);
      expect(timelines[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Error Handling", () => {
    it("should handle localStorage errors during clear", async () => {
      const originalRemoveItem = localStorageMock.removeItem;
      localStorageMock.removeItem = vi.fn().mockImplementation(() => {
        throw new Error("Storage error");
      });

      await expect(localStorageManager.clearAllData()).rejects.toThrow(
        "データの削除に失敗しました",
      );

      // Restore original function
      localStorageMock.removeItem = originalRemoveItem;
    });
  });
});
