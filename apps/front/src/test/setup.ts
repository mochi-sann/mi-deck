import "@testing-library/jest-dom/vitest";
import type { Note } from "misskey-js/entities.js";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";
import type { components } from "@/lib/api/type";

// Setup fake IndexedDB for testing
import "fake-indexeddb/auto";

// Polyfill localStorage/sessionStorage for Node test environment
const createStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem(key: string) {
      return store.has(key) ? (store.get(key) ?? null) : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    get length() {
      return store.size;
    },
  };
};

if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    value: createStorage(),
    configurable: true,
  });
}

if (typeof globalThis.sessionStorage === "undefined") {
  Object.defineProperty(globalThis, "sessionStorage", {
    value: createStorage(),
    configurable: true,
  });
}

// Define mock data type based on your schema
type TimelineEntityType =
  components["schemas"]["TimelineWithServerSessionEntity"];

// Define mock Note data
const mockNotes: Note[] = [
  {
    id: "note-1",
    createdAt: new Date().toISOString(),
    text: "Mock Note 1",
    user: {
      id: "user-1",
      username: "mockuser1",
      name: "Mock User 1",
      host: "example1.com",
      avatarUrl: "https://example1.com/avatar.png",
      avatarBlurhash: null,
      avatarDecorations: [],
      isBot: false,
      isCat: false,
      onlineStatus: "online",
      badgeRoles: [],
      emojis: {},
      instance: {
        name: "example1",
        softwareName: "Misskey",
        softwareVersion: "13.0.0",
        iconUrl: "https://example1.com/icon.png",
        faviconUrl: "https://example1.com/favicon.ico",
        themeColor: "#000000",
      },
    },
    replyId: null,
    renoteId: null,
    reply: null,
    renote: null,
    visibility: "public",
    mentions: [],
    visibleUserIds: [],
    fileIds: [],
    files: [],
    tags: [],
    poll: null,
    emojis: {},
    reactions: {},
    reactionEmojis: {},
    uri: undefined,
    url: undefined,
    userId: "user-1",
    myReaction: null,
    reactionCount: 1,
    renoteCount: 1,
    reactionAcceptance: null,
    repliesCount: 10,
  },
  {
    id: "note-2",
    createdAt: new Date().toISOString(),
    text: "Mock Note 2",
    user: {
      id: "user-2",
      username: "mockuser2",
      name: "Mock User 1",
      host: "example1.com",
      avatarUrl: "https://example1.com/avatar.png",
      avatarBlurhash: null,
      avatarDecorations: [],
      isBot: false,
      isCat: false,
      onlineStatus: "online",
      badgeRoles: [],
      emojis: {},
      instance: {
        name: "example1",
        softwareName: "Misskey",
        softwareVersion: "13.0.0",
        iconUrl: "https://example1.com/icon.png",
        faviconUrl: "https://example1.com/favicon.ico",
        themeColor: "#000000",
      },
    },
    replyId: null,
    renoteId: null,
    reply: null,
    renote: null,
    visibility: "public",
    mentions: [],
    visibleUserIds: [],
    fileIds: [],
    files: [],
    tags: [],
    poll: null,
    emojis: {},
    reactions: {},
    reactionEmojis: {},
    uri: undefined,
    url: undefined,
    userId: "user-1",
    myReaction: null,
    reactionCount: 1,
    renoteCount: 1,
    reactionAcceptance: null,
    repliesCount: 10,
  },
];

const mockTimelines: TimelineEntityType[] = [
  {
    id: "timeline-1",
    name: "Timeline 1",
    type: "HOME", // Example type
    serverSessionId: "session-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    serverSession: {
      id: "session-1",
      origin: "https://example1.com",
      serverType: "Misskey", // Example type
      serverToken: "token-1",
    },
    order: 1,
  },
  {
    id: "timeline-2",
    name: "Timeline 2",
    type: "LOCAL", // Example type
    serverSessionId: "session-2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    serverSession: {
      id: "session-2",
      origin: "https://example2.org",
      serverType: "Misskey", // Example type
      serverToken: "token-2",
    },
    order: 2,
  },
];

// Define mock API handlers here
const handlers = [
  http.get("/api/v1/timeline", () => {
    return HttpResponse.json(mockTimelines);
  }),
  http.post("https://example1.com/api/notes/timeline", () => {
    return HttpResponse.json(mockNotes);
  }),
  http.post("https://example2.org/api/notes/local-timeline", () => {
    return HttpResponse.json(mockNotes);
  }),
  // Emoji API handlers
  http.get("https://example.com/api/emoji", ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get("name");

    if (name === "smile") {
      return HttpResponse.json({ url: "https://example.com/emoji.png" });
    }
    if (name === "smile_face") {
      return HttpResponse.json({ url: "https://example.com/emoji_face.png" });
    }
    if (name === "") {
      return HttpResponse.json({ url: "https://example.com/empty.png" });
    }

    return HttpResponse.json({ url: null });
  }),
  http.get("/api/emoji", ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get("name");

    if (name === "smile") {
      return HttpResponse.json({ url: "https://example.com/emoji.png" });
    }

    return HttpResponse.json({ url: null });
  }),
];

export const server = setupServer(...handlers);

// Start the server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());

// Close the server after all tests
afterAll(() => server.close());
