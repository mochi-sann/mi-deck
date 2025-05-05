/// <reference types="@testing-library/jest-dom" />
import { $api } from "@/lib/api/fetchClient"; // Import the actual $api object
import { components } from "@/lib/api/type";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimelineList } from "./TimelineList"; // Adjust the import path as necessary

// Mock the $api.useQuery hook
vi.mock("@/lib/api/fetchClient", () => ({
  $api: {
    useQuery: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Define mock data type based on your schema
type TimelineEntityType =
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
      // createdAt: new Date().toISOString(),
      // updatedAt: new Date().toISOString(),
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
      // userId: "user-1",
      serverToken: "token-2",
      // createdAt: new Date().toISOString(),
      // updatedAt: new Date().toISOString(),
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
    }); // Use '' or refine mock type

    render(
      <QueryClientProvider client={queryClient}>
        <TimelineList />
      </QueryClientProvider>,
    );
    // Use getByText instead of getByLabelText for the spinner's accessible text
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it("should display error message on failure", async () => {
    // Mock error state
    vi.mocked($api.useQuery).mockReturnValue({
      data: undefined,
      status: "error",
      error: new Error("Failed to fetch"),
    }); // Use '' or refine mock type

    render(
      <QueryClientProvider client={queryClient}>
        <TimelineList />
      </QueryClientProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText(/failed to load timelines/i)).toBeInTheDocument();
    });
  });

  it("should display timelines when data is loaded successfully", async () => {
    // Mock success state with data
    vi.mocked($api.useQuery).mockReturnValue({
      data: mockTimelines,
      status: "success",
      error: null,
    }); // Use '' or refine mock type

    render(
      <QueryClientProvider client={queryClient}>
        <TimelineList />
      </QueryClientProvider>,
    );

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
    }); // Use '' or refine mock type

    render(
      <QueryClientProvider client={queryClient}>
        <TimelineList />
      </QueryClientProvider>,
    );

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
