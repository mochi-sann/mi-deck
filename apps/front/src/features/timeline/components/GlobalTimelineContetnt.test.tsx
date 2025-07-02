import Text from "@/components/ui/text";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { Component, ReactNode, Suspense } from "react";
import { describe, expect, it, vi } from "vitest";
import { GlobalTimelineContent } from "./GlobalTimelineContetnt";

// Mock the APIClient
vi.mock("misskey-js/api.js", () => ({
  // biome-ignore lint/style/useNamingConvention:
  APIClient: vi.fn().mockImplementation(() => ({
    request: vi.fn().mockResolvedValue([
      {
        id: "1",
        text: "Test note 1",
        createdAt: "2024-03-20T00:00:00.000Z",
        user: {
          id: "user1",
          name: "Test User",
          username: "testuser",
        },
      },
    ]),
  })),
}));

// Mock the TimelineNotes component
vi.mock("./TimelineNotes", () => ({
  // biome-ignore lint/suspicious/noExplicitAny:
  // biome-ignore lint/style/useNamingConvention:
  TimelineNotes: ({ notes }: { notes: any[] }) => (
    <div data-testid="timeline-notes">
      {notes?.map((note) => (
        <div key={note.id} data-testid={`note-${note.id}`}>
          {note.text}
        </div>
      ))}
    </div>
  ),
}));

// Error Boundary component for testing
class TestErrorBoundary extends Component<
  { children: ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: ReactNode;
    onError?: (error: Error) => void;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Text className="text-red-500">
          Error loading notes: {this.state.error?.message || "Unknown error"}
        </Text>
      );
    }

    return this.props.children;
  }
}

describe("GlobalTimelineContent", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const defaultProps = {
    origin: "https://example.com",
    token: "test-token",
    type: "global",
  };

  const renderWithProviders = (
    ui: React.ReactNode,
    onError?: (error: Error) => void,
  ) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TestErrorBoundary onError={onError}>
          <Suspense fallback={<div>Loading...</div>}>{ui}</Suspense>
        </TestErrorBoundary>
      </QueryClientProvider>,
    );
  };

  it("renders timeline notes successfully", async () => {
    renderWithProviders(<GlobalTimelineContent {...defaultProps} />);

    // Wait for the notes to be rendered
    const timelineNotes = await screen.findByTestId("timeline-notes");
    expect(timelineNotes).toBeInTheDocument();

    // Check if the note is rendered
    const note = await screen.findByTestId("note-1");
    expect(note).toBeInTheDocument();
    expect(note).toHaveTextContent("Test note 1");
  });
});
