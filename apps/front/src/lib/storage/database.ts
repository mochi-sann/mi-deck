import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type {
  AppSettings,
  ClientAuthState,
  MisskeyServerConnection,
  TimelineConfig,
} from "./types";

interface MiDeckDb extends DBSchema {
  servers: {
    key: string;
    value: MisskeyServerConnection;
  };
  timelines: {
    key: string;
    value: TimelineConfig;
    indexes: { "by-server": string; "by-order": number };
  };
  auth: {
    key: "current";
    value: ClientAuthState;
  };
  settings: {
    key: "current";
    value: AppSettings;
  };
}

class DatabaseManager {
  private db: IDBPDatabase<MiDeckDb> | null = null;

  async initialize(): Promise<void> {
    this.db = await openDB<MiDeckDb>("mi-deck", 2, {
      upgrade(db) {
        // Servers store
        if (!db.objectStoreNames.contains("servers")) {
          db.createObjectStore("servers", { keyPath: "id" });
        }

        // Timelines store
        if (!db.objectStoreNames.contains("timelines")) {
          const timelineStore = db.createObjectStore("timelines", {
            keyPath: "id",
          });
          timelineStore.createIndex("by-server", "serverId");
          timelineStore.createIndex("by-order", "order");
        }

        // Auth state store
        if (!db.objectStoreNames.contains("auth")) {
          db.createObjectStore("auth");
        }

        // App settings store
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
      },
    });
  }

  private ensureDb(): IDBPDatabase<MiDeckDb> {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.db;
  }

  // Server management
  async addServer(
    server: Omit<MisskeyServerConnection, "id" | "createdAt" | "updatedAt">,
  ): Promise<MisskeyServerConnection> {
    const db = this.ensureDb();
    const now = new Date();
    const newServer: MisskeyServerConnection = {
      ...server,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    await db.put("servers", newServer);
    return newServer;
  }

  async getServer(id: string): Promise<MisskeyServerConnection | undefined> {
    const db = this.ensureDb();
    return await db.get("servers", id);
  }

  async getAllServers(): Promise<MisskeyServerConnection[]> {
    const db = this.ensureDb();
    return await db.getAll("servers");
  }

  async updateServer(
    id: string,
    updates: Partial<MisskeyServerConnection>,
  ): Promise<void> {
    const db = this.ensureDb();
    const server = await db.get("servers", id);
    if (!server) {
      throw new Error(`Server with id ${id} not found`);
    }

    const updatedServer = {
      ...server,
      ...updates,
      updatedAt: new Date(),
    };

    await db.put("servers", updatedServer);
  }

  async deleteServer(id: string): Promise<void> {
    const db = this.ensureDb();
    const tx = db.transaction(["servers", "timelines"], "readwrite");

    // Delete server
    await tx.objectStore("servers").delete(id);

    // Delete associated timelines
    const timelineIndex = tx.objectStore("timelines").index("by-server");
    const timelines = await timelineIndex.getAll(id);
    for (const timeline of timelines) {
      await tx.objectStore("timelines").delete(timeline.id);
    }

    await tx.done;
  }

  // Timeline management
  async addTimeline(
    timeline: Omit<TimelineConfig, "id" | "createdAt" | "updatedAt">,
  ): Promise<TimelineConfig> {
    const db = this.ensureDb();
    const now = new Date();
    const newTimeline: TimelineConfig = {
      ...timeline,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    await db.put("timelines", newTimeline);
    return newTimeline;
  }

  async getTimeline(id: string): Promise<TimelineConfig | undefined> {
    const db = this.ensureDb();
    return await db.get("timelines", id);
  }

  async getTimelinesByServer(serverId: string): Promise<TimelineConfig[]> {
    const db = this.ensureDb();
    const index = db.transaction("timelines").store.index("by-server");
    return await index.getAll(serverId);
  }

  async getAllTimelines(): Promise<TimelineConfig[]> {
    const db = this.ensureDb();
    return await db.getAll("timelines");
  }

  async updateTimeline(
    id: string,
    updates: Partial<TimelineConfig>,
  ): Promise<void> {
    const db = this.ensureDb();
    const timeline = await db.get("timelines", id);
    if (!timeline) {
      throw new Error(`Timeline with id ${id} not found`);
    }

    const updatedTimeline = {
      ...timeline,
      ...updates,
      updatedAt: new Date(),
    };

    await db.put("timelines", updatedTimeline);
  }

  async deleteTimeline(id: string): Promise<void> {
    const db = this.ensureDb();
    await db.delete("timelines", id);
  }

  async reorderTimelines(timelineIds: string[]): Promise<void> {
    const db = this.ensureDb();
    const tx = db.transaction("timelines", "readwrite");

    for (let i = 0; i < timelineIds.length; i++) {
      const timeline = await tx.store.get(timelineIds[i]);
      if (timeline) {
        timeline.order = i;
        timeline.updatedAt = new Date();
        await tx.store.put(timeline);
      }
    }

    await tx.done;
  }

  // Auth state management
  async getAuthState(): Promise<ClientAuthState | undefined> {
    const db = this.ensureDb();
    return await db.get("auth", "current");
  }

  async setAuthState(state: ClientAuthState): Promise<void> {
    const db = this.ensureDb();
    await db.put("auth", { ...state, lastUpdated: new Date() }, "current");
  }

  async clearAuthState(): Promise<void> {
    const db = this.ensureDb();
    await db.delete("auth", "current");
  }

  // App settings management
  async getAppSettings(): Promise<AppSettings | undefined> {
    const db = this.ensureDb();
    const settings = await db.get("settings", "current");
    if (!settings) {
      // Return default settings if none exist
      return {
        theme: "system",
        language: "ja",
        lastUpdated: new Date(),
        customTheme: undefined,
      };
    }
    return settings;
  }

  async setAppSettings(settings: AppSettings): Promise<void> {
    const db = this.ensureDb();
    await db.put(
      "settings",
      { ...settings, lastUpdated: new Date() },
      "current",
    );
  }

  async updateAppSettings(updates: Partial<AppSettings>): Promise<void> {
    // const _db = this.ensureDb();
    const currentSettings = await this.getAppSettings();
    const updatedSettings: AppSettings = {
      theme: "system",
      language: "ja",
      lastUpdated: new Date(),
      customTheme: undefined,
      ...currentSettings,
      ...updates,
    };
    await this.setAppSettings(updatedSettings);
  }

  // Import/Export functionality
  async exportData(): Promise<string> {
    const db = this.ensureDb();

    const [servers, timelines, authState, appSettings] = await Promise.all([
      db.getAll("servers"),
      db.getAll("timelines"),
      db.get("auth", "current"),
      db.get("settings", "current"),
    ]);

    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        servers,
        timelines,
        authState: authState || null,
        appSettings: appSettings || null,
      },
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const db = this.ensureDb();

    let importData: {
      version: number;
      exportedAt: string;
      data: {
        servers: MisskeyServerConnection[];
        timelines: TimelineConfig[];
        authState: ClientAuthState | null;
        appSettings?: AppSettings | null;
      };
    };

    try {
      importData = JSON.parse(jsonData);
    } catch (_error) {
      throw new Error("無効なJSONデータです");
    }

    // Version check
    if (!importData.version || importData.version !== 1) {
      throw new Error("サポートされていないデータバージョンです");
    }

    // Validate data structure
    if (!importData.data || typeof importData.data !== "object") {
      throw new Error("データ構造が無効です");
    }

    const { servers, timelines, authState, appSettings } = importData.data;

    // Begin transaction
    const tx = db.transaction(
      ["servers", "timelines", "auth", "settings"],
      "readwrite",
    );

    try {
      // Clear existing data (optional - you might want to make this configurable)
      await tx.objectStore("servers").clear();
      await tx.objectStore("timelines").clear();
      await tx.objectStore("auth").clear();
      await tx.objectStore("settings").clear();

      // Import servers
      if (Array.isArray(servers)) {
        for (const server of servers) {
          // Convert date strings back to Date objects
          const serverWithDates = {
            ...server,
            createdAt: new Date(server.createdAt),
            updatedAt: new Date(server.updatedAt),
          };
          await tx.objectStore("servers").put(serverWithDates);
        }
      }

      // Import timelines
      if (Array.isArray(timelines)) {
        for (const timeline of timelines) {
          // Convert date strings back to Date objects
          const timelineWithDates = {
            ...timeline,
            createdAt: new Date(timeline.createdAt),
            updatedAt: new Date(timeline.updatedAt),
          };
          await tx.objectStore("timelines").put(timelineWithDates);
        }
      }

      // Import auth state
      if (authState) {
        const authStateWithDates = {
          ...authState,
          lastUpdated: new Date(authState.lastUpdated),
        };
        await tx.objectStore("auth").put(authStateWithDates, "current");
      }

      // Import app settings
      if (appSettings) {
        const settingsWithDates = {
          ...appSettings,
          lastUpdated: new Date(appSettings.lastUpdated),
        };
        await tx.objectStore("settings").put(settingsWithDates, "current");
      }

      await tx.done;
    } catch (error) {
      tx.abort();
      throw new Error(
        `データのインポートに失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  }

  async clearAllData(): Promise<void> {
    const db = this.ensureDb();
    const tx = db.transaction(
      ["servers", "timelines", "auth", "settings"],
      "readwrite",
    );

    await Promise.all([
      tx.objectStore("servers").clear(),
      tx.objectStore("timelines").clear(),
      tx.objectStore("auth").clear(),
      tx.objectStore("settings").clear(),
    ]);

    await tx.done;
  }
}

export const databaseManager = new DatabaseManager();
export { DatabaseManager };
