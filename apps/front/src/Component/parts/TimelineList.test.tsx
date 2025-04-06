import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimelineList } from "./TimelineList"; // Adjust the import path as necessary
import { $api } from "@/lib/api/fetchClient"; // Import the actual $api object
import { components } from "@/lib/api/type";

// Mock the $api.useQuery hook
vi.mock("@/lib/api/fetchClient", () => ({
  $api: {
    useQuery: vi.fn(),
  },
}));

// Define mock data type based on your schema
type TimelineEntityType =
  components["schemas"]["TimelineWithServerSessionEntity"];

const mockTimelines: TimelineEntityType[] = [
  {
    id: "timeline-1",
    name: "Timeline 1",
    type: "home", // Example type
    serverSessionId: "session-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    serverSession: {
      id: "session-1",
      origin: "https://example1.com",
      serverType: "misskey", // Example type
      userId: "user-1",
      serverToken: "token-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: "timeline-2",
    name: "Timeline 2",
    type: "local", // Example type
    serverSessionId: "session-2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    serverSession: {
      id: "session-2",
      origin: "https://example2.org",
      serverType: "misskey", // Example type
      userId: "user-1",
      serverToken: "token-2",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
];

describe("TimelineList", () => {
  it("should display spinner while loading", () => {
    // Mock loading state
    vi.mocked($api.useQuery).mockReturnValue({
      data: undefined,
      status: "pending",
      error: null,
    } as any); // Use 'as any' or refine mock type

    render(<TimelineList />);
    expect(screen.getByLabelText(/loading timelines/i)).toBeInTheDocument();
  });

  it("should display error message on failure", async () => {
    // Mock error state
    vi.mocked($api.useQuery).mockReturnValue({
      data: undefined,
      status: "error",
      error: new Error("Failed to fetch"),
    } as any); // Use 'as any' or refine mock type

    render(<TimelineList />);
    await waitFor(() => {
      expect(
        screen.getByText(/failed to load timelines/i),
      ).toBeInTheDocument();
    });
  });

  it("should display timelines when data is loaded successfully", async () => {
    // Mock success state with data
    vi.mocked($api.useQuery).mockReturnValue({
      data: mockTimelines,
      status: "success",
      error: null,
    } as any); // Use 'as any' or refine mock type

    render(<TimelineList />);

    await waitFor(() => {
      // Check for timeline names and origins
      expect(screen.getByText(/Timeline 1/i)).toBeInTheDocument();
      expect(screen.getByText(/home @ example1.com/i)).toBeInTheDocument();
      expect(screen.getByText(/Timeline 2/i)).toBeInTheDocument();
      expect(screen.getByText(/local @ example2.org/i)).toBeInTheDocument();
    });

    // Check that loading/error messages are not present
    expect(
      screen.queryByLabelText(/loading timelines/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/failed to load timelines/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/no timelines created yet/i),
    ).not.toBeInTheDocument();
  });

  it('should display "No timelines created yet" when data is empty', async () => {
    // Mock success state with empty data
    vi.mocked($api.useQuery).mockReturnValue({
      data: [],
      status: "success",
      error: null,
    } as any); // Use 'as any' or refine mock type

    render(<TimelineList />);

    await waitFor(() => {
      expect(screen.getByText(/no timelines created yet/i)).toBeInTheDocument();
    });

    // Check that loading/error/timeline cards are not present
    expect(
      screen.queryByLabelText(/loading timelines/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/failed to load timelines/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Timeline 1/i)).not.toBeInTheDocument();
  });
});
