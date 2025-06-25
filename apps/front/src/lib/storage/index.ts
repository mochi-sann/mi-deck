import { databaseManager } from "./database";
import { localStorageManager } from "./localStorage";
import type {
  ClientAuthState,
  MisskeyServerConnection,
  TimelineConfig,
} from "./types";

interface StorageInterface {
  addServer(
    server: Omit<MisskeyServerConnection, "id" | "createdAt" | "updatedAt">,
  ): Promise<MisskeyServerConnection>;
  getServer(id: string): Promise<MisskeyServerConnection | undefined>;
  getAllServers(): Promise<MisskeyServerConnection[]>;
  updateServer(
    id: string,
    updates: Partial<MisskeyServerConnection>,
  ): Promise<void>;
  deleteServer(id: string): Promise<void>;

  addTimeline(
    timeline: Omit<TimelineConfig, "id" | "createdAt" | "updatedAt">,
  ): Promise<TimelineConfig>;
  getTimeline(id: string): Promise<TimelineConfig | undefined>;
  getTimelinesByServer(serverId: string): Promise<TimelineConfig[]>;
  getAllTimelines(): Promise<TimelineConfig[]>;
  updateTimeline(id: string, updates: Partial<TimelineConfig>): Promise<void>;
  deleteTimeline(id: string): Promise<void>;
  reorderTimelines(timelineIds: string[]): Promise<void>;

  getAuthState(): Promise<ClientAuthState | undefined>;
  setAuthState(state: ClientAuthState): Promise<void>;
  clearAuthState(): Promise<void>;
}

class StorageManager implements StorageInterface {
  private storage: StorageInterface;
  private initialized = false;

  constructor() {
    this.storage = localStorageManager;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await databaseManager.initialize();
      this.storage = databaseManager;
      console.log("Using IndexedDB for storage");
    } catch (error) {
      console.warn(
        "IndexedDB not available, falling back to localStorage:",
        error,
      );
      this.storage = localStorageManager;
    }

    this.initialized = true;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("Storage not initialized. Call initialize() first.");
    }
  }

  // Server management
  async addServer(
    server: Omit<MisskeyServerConnection, "id" | "createdAt" | "updatedAt">,
  ): Promise<MisskeyServerConnection> {
    this.ensureInitialized();
    return this.storage.addServer(server);
  }

  async getServer(id: string): Promise<MisskeyServerConnection | undefined> {
    this.ensureInitialized();
    return this.storage.getServer(id);
  }

  async getAllServers(): Promise<MisskeyServerConnection[]> {
    this.ensureInitialized();
    return this.storage.getAllServers();
  }

  async updateServer(
    id: string,
    updates: Partial<MisskeyServerConnection>,
  ): Promise<void> {
    this.ensureInitialized();
    return this.storage.updateServer(id, updates);
  }

  async deleteServer(id: string): Promise<void> {
    this.ensureInitialized();
    return this.storage.deleteServer(id);
  }

  // Timeline management
  async addTimeline(
    timeline: Omit<TimelineConfig, "id" | "createdAt" | "updatedAt">,
  ): Promise<TimelineConfig> {
    this.ensureInitialized();
    return this.storage.addTimeline(timeline);
  }

  async getTimeline(id: string): Promise<TimelineConfig | undefined> {
    this.ensureInitialized();
    return this.storage.getTimeline(id);
  }

  async getTimelinesByServer(serverId: string): Promise<TimelineConfig[]> {
    this.ensureInitialized();
    return this.storage.getTimelinesByServer(serverId);
  }

  async getAllTimelines(): Promise<TimelineConfig[]> {
    this.ensureInitialized();
    return this.storage.getAllTimelines();
  }

  async updateTimeline(
    id: string,
    updates: Partial<TimelineConfig>,
  ): Promise<void> {
    this.ensureInitialized();
    return this.storage.updateTimeline(id, updates);
  }

  async deleteTimeline(id: string): Promise<void> {
    this.ensureInitialized();
    return this.storage.deleteTimeline(id);
  }

  async reorderTimelines(timelineIds: string[]): Promise<void> {
    this.ensureInitialized();
    return this.storage.reorderTimelines(timelineIds);
  }

  // Auth state management
  async getAuthState(): Promise<ClientAuthState | undefined> {
    this.ensureInitialized();
    return this.storage.getAuthState();
  }

  async setAuthState(state: ClientAuthState): Promise<void> {
    this.ensureInitialized();
    return this.storage.setAuthState(state);
  }

  async clearAuthState(): Promise<void> {
    this.ensureInitialized();
    return this.storage.clearAuthState();
  }
}

export const storageManager = new StorageManager();
export * from "./types";
