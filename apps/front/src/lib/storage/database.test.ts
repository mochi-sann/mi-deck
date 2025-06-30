import { beforeEach, describe, expect, it } from "vitest";
import { DatabaseManager, databaseManager } from "./database";
import type { MisskeyServerConnection, TimelineConfig } from "./types";

describe("DatabaseManager", () => {
  beforeEach(async () => {
    // Initialize the database before each test
    await databaseManager.initialize();

    // Clear all data to ensure clean state
    const servers = await databaseManager.getAllServers();
    for (const server of servers) {
      await databaseManager.deleteServer(server.id);
    }

    const timelines = await databaseManager.getAllTimelines();
    for (const timeline of timelines) {
      await databaseManager.deleteTimeline(timeline.id);
    }

    await databaseManager.clearAuthState();
  });

  describe("Server Management", () => {
    const mockServerData: Omit<
      MisskeyServerConnection,
      "id" | "createdAt" | "updatedAt"
    > = {
      origin: "https://misskey.example.com",
      accessToken: "test-token-123",
      isActive: true,
      userInfo: {
        id: "user-123",
        username: "testuser",
        name: "Test User",
        avatarUrl: "https://example.com/avatar.png",
      },
      serverInfo: {
        name: "Test Misskey",
        version: "13.0.0",
        description: "Test server",
        iconUrl: "https://example.com/icon.png",
      },
    };

    it("should add a server successfully", async () => {
      const server = await databaseManager.addServer(mockServerData);

      expect(server).toMatchObject(mockServerData);
      expect(server.id).toBeDefined();
      expect(server.createdAt).toBeInstanceOf(Date);
      expect(server.updatedAt).toBeInstanceOf(Date);
    });

    it("should retrieve a server by id", async () => {
      const addedServer = await databaseManager.addServer(mockServerData);
      const retrievedServer = await databaseManager.getServer(addedServer.id);

      expect(retrievedServer).toEqual(addedServer);
    });

    it("should return undefined for non-existent server", async () => {
      const result = await databaseManager.getServer("non-existent-id");
      expect(result).toBeUndefined();
    });

    it("should get all servers", async () => {
      const server1 = await databaseManager.addServer(mockServerData);
      const server2 = await databaseManager.addServer({
        ...mockServerData,
        origin: "https://another.example.com",
      });

      const allServers = await databaseManager.getAllServers();
      expect(allServers).toHaveLength(2);
      expect(allServers).toContainEqual(server1);
      expect(allServers).toContainEqual(server2);
    });

    it("should update a server", async () => {
      const server = await databaseManager.addServer(mockServerData);

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updates = {
        isActive: false,
        userInfo: { ...mockServerData.userInfo!, name: "Updated Name" },
      };

      await databaseManager.updateServer(server.id, updates);
      const updatedServer = await databaseManager.getServer(server.id);

      expect(updatedServer?.isActive).toBe(false);
      expect(updatedServer?.userInfo?.name).toBe("Updated Name");
      expect(updatedServer?.updatedAt.getTime()).toBeGreaterThan(
        server.updatedAt.getTime(),
      );
    });

    it("should throw error when updating non-existent server", async () => {
      await expect(
        databaseManager.updateServer("non-existent-id", { isActive: false }),
      ).rejects.toThrow("Server with id non-existent-id not found");
    });

    it("should delete a server and its timelines", async () => {
      const server = await databaseManager.addServer(mockServerData);

      // Add timeline for this server
      const timelineData: Omit<
        TimelineConfig,
        "id" | "createdAt" | "updatedAt"
      > = {
        name: "Test Timeline",
        serverId: server.id,
        type: "home",
        order: 0,
        isVisible: true,
      };
      await databaseManager.addTimeline(timelineData);

      // Verify timeline exists
      const timelinesBefore = await databaseManager.getTimelinesByServer(
        server.id,
      );
      expect(timelinesBefore).toHaveLength(1);

      // Delete server
      await databaseManager.deleteServer(server.id);

      // Verify server is deleted
      const deletedServer = await databaseManager.getServer(server.id);
      expect(deletedServer).toBeUndefined();

      // Verify associated timelines are deleted
      const timelinesAfter = await databaseManager.getTimelinesByServer(
        server.id,
      );
      expect(timelinesAfter).toHaveLength(0);
    });
  });

  describe("Timeline Management", () => {
    let testServerId: string;

    beforeEach(async () => {
      const server = await databaseManager.addServer({
        origin: "https://test.example.com",
        isActive: true,
      });
      testServerId = server.id;
    });

    const mockTimelineData: Omit<
      TimelineConfig,
      "id" | "createdAt" | "updatedAt" | "serverId"
    > = {
      name: "Test Timeline",
      type: "home",
      order: 0,
      isVisible: true,
      settings: {
        withReplies: true,
        withFiles: false,
        excludeNsfw: true,
      },
    };

    it("should add a timeline successfully", async () => {
      const timeline = await databaseManager.addTimeline({
        ...mockTimelineData,
        serverId: testServerId,
      });

      expect(timeline).toMatchObject({
        ...mockTimelineData,
        serverId: testServerId,
      });
      expect(timeline.id).toBeDefined();
      expect(timeline.createdAt).toBeInstanceOf(Date);
      expect(timeline.updatedAt).toBeInstanceOf(Date);
    });

    it("should retrieve a timeline by id", async () => {
      const addedTimeline = await databaseManager.addTimeline({
        ...mockTimelineData,
        serverId: testServerId,
      });
      const retrievedTimeline = await databaseManager.getTimeline(
        addedTimeline.id,
      );

      expect(retrievedTimeline).toEqual(addedTimeline);
    });

    it("should return undefined for non-existent timeline", async () => {
      const result = await databaseManager.getTimeline("non-existent-id");
      expect(result).toBeUndefined();
    });

    it("should get timelines by server", async () => {
      const timeline1 = await databaseManager.addTimeline({
        ...mockTimelineData,
        serverId: testServerId,
        name: "Timeline 1",
      });
      const timeline2 = await databaseManager.addTimeline({
        ...mockTimelineData,
        serverId: testServerId,
        name: "Timeline 2",
      });

      const serverTimelines =
        await databaseManager.getTimelinesByServer(testServerId);
      expect(serverTimelines).toHaveLength(2);
      expect(serverTimelines).toContainEqual(timeline1);
      expect(serverTimelines).toContainEqual(timeline2);
    });

    it("should get all timelines", async () => {
      const timeline1 = await databaseManager.addTimeline({
        ...mockTimelineData,
        serverId: testServerId,
        name: "Timeline 1",
      });
      const timeline2 = await databaseManager.addTimeline({
        ...mockTimelineData,
        serverId: testServerId,
        name: "Timeline 2",
      });

      const allTimelines = await databaseManager.getAllTimelines();
      expect(allTimelines).toHaveLength(2);
      expect(allTimelines).toContainEqual(timeline1);
      expect(allTimelines).toContainEqual(timeline2);
    });

    it("should update a timeline", async () => {
      const timeline = await databaseManager.addTimeline({
        ...mockTimelineData,
        serverId: testServerId,
      });

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updates = {
        name: "Updated Timeline",
        isVisible: false,
        settings: { withReplies: false, withFiles: true, excludeNsfw: false },
      };

      await databaseManager.updateTimeline(timeline.id, updates);
      const updatedTimeline = await databaseManager.getTimeline(timeline.id);

      expect(updatedTimeline?.name).toBe("Updated Timeline");
      expect(updatedTimeline?.isVisible).toBe(false);
      expect(updatedTimeline?.settings).toEqual(updates.settings);
      expect(updatedTimeline?.updatedAt.getTime()).toBeGreaterThan(
        timeline.updatedAt.getTime(),
      );
    });

    it("should throw error when updating non-existent timeline", async () => {
      await expect(
        databaseManager.updateTimeline("non-existent-id", { name: "New Name" }),
      ).rejects.toThrow("Timeline with id non-existent-id not found");
    });

    it("should delete a timeline", async () => {
      const timeline = await databaseManager.addTimeline({
        ...mockTimelineData,
        serverId: testServerId,
      });

      await databaseManager.deleteTimeline(timeline.id);
      const deletedTimeline = await databaseManager.getTimeline(timeline.id);
      expect(deletedTimeline).toBeUndefined();
    });

    it("should reorder timelines", async () => {
      const timeline1 = await databaseManager.addTimeline({
        ...mockTimelineData,
        serverId: testServerId,
        name: "Timeline 1",
        order: 0,
      });
      const timeline2 = await databaseManager.addTimeline({
        ...mockTimelineData,
        serverId: testServerId,
        name: "Timeline 2",
        order: 1,
      });
      const timeline3 = await databaseManager.addTimeline({
        ...mockTimelineData,
        serverId: testServerId,
        name: "Timeline 3",
        order: 2,
      });

      // Reorder: timeline3, timeline1, timeline2
      const newOrder = [timeline3.id, timeline1.id, timeline2.id];
      await databaseManager.reorderTimelines(newOrder);

      const reorderedTimeline1 = await databaseManager.getTimeline(
        timeline1.id,
      );
      const reorderedTimeline2 = await databaseManager.getTimeline(
        timeline2.id,
      );
      const reorderedTimeline3 = await databaseManager.getTimeline(
        timeline3.id,
      );

      expect(reorderedTimeline3?.order).toBe(0);
      expect(reorderedTimeline1?.order).toBe(1);
      expect(reorderedTimeline2?.order).toBe(2);
    });
  });

  describe("Auth State Management", () => {
    it("should set and get auth state", async () => {
      const authState = {
        currentServerId: "server-123",
        servers: [],
        timelines: [],
        lastUpdated: new Date(),
      };

      await databaseManager.setAuthState(authState);
      const retrievedState = await databaseManager.getAuthState();

      expect(retrievedState?.currentServerId).toBe("server-123");
      expect(retrievedState?.lastUpdated).toBeInstanceOf(Date);
    });

    it("should return undefined when no auth state exists", async () => {
      const result = await databaseManager.getAuthState();
      expect(result).toBeUndefined();
    });

    it("should clear auth state", async () => {
      const authState = {
        currentServerId: "server-123",
        servers: [],
        timelines: [],
        lastUpdated: new Date(),
      };

      await databaseManager.setAuthState(authState);
      await databaseManager.clearAuthState();

      const result = await databaseManager.getAuthState();
      expect(result).toBeUndefined();
    });
  });

  describe("Import/Export Functionality", () => {
    let testServerId: string;
    let testTimelineId: string;

    beforeEach(async () => {
      // Add test server
      const server = await databaseManager.addServer({
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
      const timeline = await databaseManager.addTimeline({
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
      await databaseManager.setAuthState({
        currentServerId: testServerId,
        servers: [server],
        timelines: [timeline],
        lastUpdated: new Date(),
      });
    });

    it("should export data successfully", async () => {
      const exportedData = await databaseManager.exportData();
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
      const exportedData = await databaseManager.exportData();

      // Clear all data
      await databaseManager.clearAllData();

      // Verify data is cleared
      const serversAfterClear = await databaseManager.getAllServers();
      const timelinesAfterClear = await databaseManager.getAllTimelines();
      const authStateAfterClear = await databaseManager.getAuthState();

      expect(serversAfterClear).toHaveLength(0);
      expect(timelinesAfterClear).toHaveLength(0);
      expect(authStateAfterClear).toBeUndefined();

      // Import data back
      await databaseManager.importData(exportedData);

      // Verify data is restored
      const serversAfterImport = await databaseManager.getAllServers();
      const timelinesAfterImport = await databaseManager.getAllTimelines();
      const authStateAfterImport = await databaseManager.getAuthState();

      expect(serversAfterImport).toHaveLength(1);
      expect(serversAfterImport[0].origin).toBe("https://test.example.com");
      expect(serversAfterImport[0].createdAt).toBeInstanceOf(Date);
      expect(serversAfterImport[0].updatedAt).toBeInstanceOf(Date);

      expect(timelinesAfterImport).toHaveLength(1);
      expect(timelinesAfterImport[0].name).toBe("Test Timeline");
      expect(timelinesAfterImport[0].createdAt).toBeInstanceOf(Date);
      expect(timelinesAfterImport[0].updatedAt).toBeInstanceOf(Date);

      expect(authStateAfterImport).toBeDefined();
      expect(authStateAfterImport?.currentServerId).toBe(testServerId);
      expect(authStateAfterImport?.lastUpdated).toBeInstanceOf(Date);
    });

    it("should handle invalid JSON during import", async () => {
      await expect(databaseManager.importData("invalid json")).rejects.toThrow(
        "無効なJSONデータです",
      );
    });

    it("should handle unsupported version during import", async () => {
      const invalidData = JSON.stringify({
        version: 999,
        data: {},
      });

      await expect(databaseManager.importData(invalidData)).rejects.toThrow(
        "サポートされていないデータバージョンです",
      );
    });

    it("should handle invalid data structure during import", async () => {
      const invalidData = JSON.stringify({
        version: 1,
        // Missing data property
      });

      await expect(databaseManager.importData(invalidData)).rejects.toThrow(
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

      await databaseManager.importData(emptyData);

      const servers = await databaseManager.getAllServers();
      const timelines = await databaseManager.getAllTimelines();
      const authState = await databaseManager.getAuthState();

      expect(servers).toHaveLength(0);
      expect(timelines).toHaveLength(0);
      expect(authState).toBeUndefined();
    });

    it("should clear all data successfully", async () => {
      // Verify data exists
      const serversBefore = await databaseManager.getAllServers();
      const timelinesBefore = await databaseManager.getAllTimelines();
      const authStateBefore = await databaseManager.getAuthState();

      expect(serversBefore).toHaveLength(1);
      expect(timelinesBefore).toHaveLength(1);
      expect(authStateBefore).toBeDefined();

      // Clear all data
      await databaseManager.clearAllData();

      // Verify data is cleared
      const serversAfter = await databaseManager.getAllServers();
      const timelinesAfter = await databaseManager.getAllTimelines();
      const authStateAfter = await databaseManager.getAuthState();

      expect(serversAfter).toHaveLength(0);
      expect(timelinesAfter).toHaveLength(0);
      expect(authStateAfter).toBeUndefined();
    });

    it("should preserve data relationships during import/export", async () => {
      // Export data
      const exportedData = await databaseManager.exportData();

      // Clear and import
      await databaseManager.clearAllData();
      await databaseManager.importData(exportedData);

      // Verify relationships
      const servers = await databaseManager.getAllServers();
      const timelines = await databaseManager.getAllTimelines();

      expect(timelines[0].serverId).toBe(servers[0].id);

      // Verify timeline can be retrieved by server
      const serverTimelines = await databaseManager.getTimelinesByServer(
        servers[0].id,
      );
      expect(serverTimelines).toHaveLength(1);
      expect(serverTimelines[0].id).toBe(timelines[0].id);
    });
  });

  describe("Error Handling", () => {
    it("should throw error when database is not initialized", async () => {
      // Test the ensureDB method by accessing a new database manager instance
      // that hasn't been initialized
      const uninitializedManager = new DatabaseManager();

      await expect(uninitializedManager.getAllServers()).rejects.toThrow(
        "Database not initialized",
      );
    });
  });
});
