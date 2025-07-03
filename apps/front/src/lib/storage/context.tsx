import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { storageManager } from "./index";
import type {
  AppSettings,
  ClientAuthState,
  MisskeyServerConnection,
  TimelineConfig,
} from "./types";

interface StorageContextValue {
  // State
  servers: MisskeyServerConnection[];
  timelines: TimelineConfig[];
  currentServerId?: string;
  appSettings?: AppSettings;
  isLoading: boolean;
  error?: string;
  retryCount: number;

  // Server operations
  addServer: (
    server: Omit<MisskeyServerConnection, "id" | "createdAt" | "updatedAt">,
  ) => Promise<MisskeyServerConnection>;
  updateServer: (
    id: string,
    updates: Partial<MisskeyServerConnection>,
  ) => Promise<void>;
  deleteServer: (id: string) => Promise<void>;
  setCurrentServer: (serverId?: string) => Promise<void>;

  // Timeline operations
  addTimeline: (
    timeline: Omit<TimelineConfig, "id" | "createdAt" | "updatedAt">,
  ) => Promise<TimelineConfig>;
  updateTimeline: (
    id: string,
    updates: Partial<TimelineConfig>,
  ) => Promise<void>;
  deleteTimeline: (id: string) => Promise<void>;
  reorderTimelines: (timelineIds: string[]) => Promise<void>;

  // App settings operations
  updateAppSettings: (updates: Partial<AppSettings>) => Promise<void>;

  // Utility and Error Recovery
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  clearError: () => void;
  reinitializeStorage: () => Promise<void>;
}

const StorageContext = createContext<StorageContextValue | null>(null);

interface StorageProviderProps {
  children: ReactNode;
}

export function StorageProvider({ children }: StorageProviderProps) {
  const [servers, setServers] = useState<MisskeyServerConnection[]>([]);
  const [timelines, setTimelines] = useState<TimelineConfig[]>([]);
  const [currentServerId, setCurrentServerId] = useState<string | undefined>();
  const [appSettings, setAppSettings] = useState<AppSettings | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [retryCount, setRetryCount] = useState(0);
  const [isStorageInitialized, setIsStorageInitialized] = useState(false);

  // Create storage-specific error with enhanced information
  const createStorageError = useCallback(
    (originalError: unknown, context: string): Error => {
      const baseMessage =
        originalError instanceof Error
          ? originalError.message
          : "Unknown storage error";

      // Create a new error with enhanced context for error boundaries
      const storageError = new Error(
        `Storage Error (${context}): ${baseMessage}`,
      );
      storageError.name = "StorageError";

      // Add cause property manually for compatibility
      Object.defineProperty(storageError, "cause", {
        value: originalError,
        enumerable: false,
        writable: false,
      });

      // Add specific error properties for error boundary detection
      Object.defineProperty(storageError, "isStorageError", {
        value: true,
        enumerable: false,
      });

      return storageError;
    },
    [],
  );

  const shouldAutoRetry = useCallback((error: unknown): boolean => {
    if (!(error instanceof Error)) return false;

    // Don't auto-retry for certain types of errors
    if (
      error.name === "QuotaExceededError" ||
      error.name === "NotAllowedError" ||
      error.name === "SecurityError"
    ) {
      return false;
    }

    // Auto-retry for transient errors
    return (
      error.message.includes("Failed to load") ||
      error.message.includes("network") ||
      error.message.includes("timeout")
    );
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      if (!isStorageInitialized) {
        const initError = createStorageError(
          new Error("Storage not initialized"),
          "Data Loading",
        );
        throw initError;
      }

      const [serverData, timelineData, authState, settings] = await Promise.all(
        [
          storageManager.getAllServers(),
          storageManager.getAllTimelines(),
          storageManager.getAuthState(),
          storageManager.getAppSettings(),
        ],
      );

      setServers(serverData);
      setTimelines(timelineData.sort((a, b) => a.order - b.order));
      setCurrentServerId(authState?.currentServerId);
      setAppSettings(settings);
      setRetryCount(0); // Reset retry count on successful load
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);
      console.error("Failed to load storage data:", err);

      // Auto-retry for certain types of errors
      if (retryCount < 3 && shouldAutoRetry(err)) {
        setRetryCount((prev) => prev + 1);
        setTimeout(() => loadData(), 1000 * (retryCount + 1)); // Exponential backoff
      } else if (retryCount >= 3) {
        // After max retries, throw enhanced error for error boundary
        const maxRetryError = createStorageError(
          err,
          `Data Loading (max retries exceeded: ${retryCount})`,
        );
        throw maxRetryError;
      }
    } finally {
      setIsLoading(false);
    }
  }, [isStorageInitialized, retryCount, createStorageError, shouldAutoRetry]);

  const initializeStorage = useCallback(async () => {
    try {
      await storageManager.initialize();
      setIsStorageInitialized(true);
      await loadData();
    } catch (err) {
      console.error("Failed to initialize storage:", err);
      setError("Failed to initialize storage");
      setIsLoading(false);
      setIsStorageInitialized(false);
    }
  }, [loadData]);

  const reinitializeStorage = async () => {
    setIsStorageInitialized(false);
    setRetryCount(0);
    setError(undefined);

    // Reset storage manager state
    storageManager.reset();

    await initializeStorage();
  };

  const clearError = () => {
    setError(undefined);
    setRetryCount(0);
  };

  const retry = async () => {
    if (isStorageInitialized) {
      await loadData();
    } else {
      await initializeStorage();
    }
  };

  const updateAuthState = async (updates: Partial<ClientAuthState>) => {
    const currentState = await storageManager.getAuthState();
    const newState: ClientAuthState = {
      currentServerId,
      servers,
      timelines,
      lastUpdated: new Date(),
      ...currentState,
      ...updates,
    };
    await storageManager.setAuthState(newState);
  };

  // Initialize storage and load data
  useEffect(() => {
    initializeStorage();
  }, [initializeStorage]);

  // Enhanced error handling wrapper for storage operations
  const withErrorHandling = async <T,>(
    operation: () => Promise<T>,
    errorContext: string,
  ): Promise<T> => {
    try {
      return await operation();
    } catch (err) {
      console.error(`${errorContext}:`, err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      // For certain errors, try to recover by reinitializing storage
      if (
        errorMessage.includes("Storage not initialized") ||
        errorMessage.includes("Database not initialized")
      ) {
        try {
          await reinitializeStorage();
          return await operation(); // Retry the operation
        } catch (retryErr) {
          console.error(`Retry failed for ${errorContext}:`, retryErr);
          // Throw enhanced error for error boundaries to catch
          throw createStorageError(retryErr, errorContext);
        }
      }

      // Throw enhanced error for error boundaries to catch
      throw createStorageError(err, errorContext);
    }
  };

  // Server operations
  const addServer = async (
    server: Omit<MisskeyServerConnection, "id" | "createdAt" | "updatedAt">,
  ) => {
    return withErrorHandling(async () => {
      const newServer = await storageManager.addServer(server);
      setServers((prev) => [...prev, newServer]);
      await updateAuthState({ servers: [...servers, newServer] });
      return newServer;
    }, "Failed to add server");
  };

  const updateServer = async (
    id: string,
    updates: Partial<MisskeyServerConnection>,
  ) => {
    return withErrorHandling(async () => {
      await storageManager.updateServer(id, updates);
      setServers((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s,
        ),
      );
      const updatedServers = servers.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s,
      );
      await updateAuthState({ servers: updatedServers });
    }, "Failed to update server");
  };

  const deleteServer = async (id: string) => {
    return withErrorHandling(async () => {
      await storageManager.deleteServer(id);
      setServers((prev) => prev.filter((s) => s.id !== id));
      setTimelines((prev) => prev.filter((t) => t.serverId !== id));

      if (currentServerId === id) {
        const newCurrentServerId = servers.find((s) => s.id !== id)?.id;
        setCurrentServerId(newCurrentServerId);
        await updateAuthState({
          currentServerId: newCurrentServerId,
          servers: servers.filter((s) => s.id !== id),
          timelines: timelines.filter((t) => t.serverId !== id),
        });
      } else {
        await updateAuthState({
          servers: servers.filter((s) => s.id !== id),
          timelines: timelines.filter((t) => t.serverId !== id),
        });
      }
    }, "Failed to delete server");
  };

  const setCurrentServer = async (serverId?: string) => {
    return withErrorHandling(async () => {
      setCurrentServerId(serverId);
      await updateAuthState({ currentServerId: serverId });
    }, "Failed to set current server");
  };

  // Timeline operations
  const addTimeline = async (
    timeline: Omit<TimelineConfig, "id" | "createdAt" | "updatedAt">,
  ) => {
    return withErrorHandling(async () => {
      const newTimeline = await storageManager.addTimeline(timeline);
      setTimelines((prev) =>
        [...prev, newTimeline].sort((a, b) => a.order - b.order),
      );
      await updateAuthState({ timelines: [...timelines, newTimeline] });
      return newTimeline;
    }, "Failed to add timeline");
  };

  const updateTimeline = async (
    id: string,
    updates: Partial<TimelineConfig>,
  ) => {
    return withErrorHandling(async () => {
      await storageManager.updateTimeline(id, updates);
      setTimelines((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t,
        ),
      );
      const updatedTimelines = timelines.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t,
      );
      await updateAuthState({ timelines: updatedTimelines });
    }, "Failed to update timeline");
  };

  const deleteTimeline = async (id: string) => {
    return withErrorHandling(async () => {
      await storageManager.deleteTimeline(id);
      setTimelines((prev) => prev.filter((t) => t.id !== id));
      await updateAuthState({
        timelines: timelines.filter((t) => t.id !== id),
      });
    }, "Failed to delete timeline");
  };

  const reorderTimelines = async (timelineIds: string[]) => {
    return withErrorHandling(async () => {
      await storageManager.reorderTimelines(timelineIds);
      const reorderedTimelines = timelineIds
        .map((id, index) => {
          const timeline = timelines.find((t) => t.id === id);
          return timeline
            ? { ...timeline, order: index, updatedAt: new Date() }
            : null;
        })
        .filter(Boolean) as TimelineConfig[];

      setTimelines(reorderedTimelines);
      await updateAuthState({ timelines: reorderedTimelines });
    }, "Failed to reorder timelines");
  };

  const refresh = async () => {
    return withErrorHandling(async () => {
      await loadData();
    }, "Failed to refresh data");
  };

  // App settings operations
  const updateAppSettings = async (updates: Partial<AppSettings>) => {
    return withErrorHandling(async () => {
      await storageManager.updateAppSettings(updates);
      const updatedSettings = await storageManager.getAppSettings();
      setAppSettings(updatedSettings);
    }, "Failed to update app settings");
  };

  const value: StorageContextValue = {
    servers,
    timelines,
    currentServerId,
    appSettings,
    isLoading,
    error,
    retryCount,
    addServer,
    updateServer,
    deleteServer,
    setCurrentServer,
    addTimeline,
    updateTimeline,
    deleteTimeline,
    reorderTimelines,
    updateAppSettings,
    refresh,
    retry,
    clearError,
    reinitializeStorage,
  };

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
}
