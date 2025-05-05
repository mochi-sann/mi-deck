import "@testing-library/jest-dom/vitest";
import { components } from "@/lib/api/type";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";

// Define mock data type based on your schema
type TimelineEntityType =
  // operations["timeline"]["get"]["responses"]["200"]["content"]["application/json"][
  components["schemas"]["TimelineWithServerSessionEntity"];

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
  },
];

// Define mock API handlers here
const handlers = [
  http.get("/api/v1/timeline", () => {
    return HttpResponse.json(mockTimelines);
  }),
];

const server = setupServer(...handlers);

// Start the server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());

// Close the server after all tests
afterAll(() => server.close());
