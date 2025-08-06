import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ListTimelineContent } from "./ListTimelineContent";

// Mock @tanstack/react-virtual
vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: vi.fn(() => ({
    getVirtualItems: vi.fn(() => [
      { index: 0, start: 0, size: 100 },
      { index: 1, start: 100, size: 100 },
    ]),
    getTotalSize: vi.fn(() => 200),
    measureElement: vi.fn(),
  })),
}));

// Mock the useListTimeline hook
vi.mock("../hooks/useListTimeline", () => ({
  useListTimeline: vi.fn(),
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  // biome-ignore lint/style/useNamingConvention: Mock component
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button type="button" onClick={onClick} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/spinner", () => ({
  // biome-ignore lint/style/useNamingConvention: Mock component
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

vi.mock("@/components/ui/text", () => ({
  default: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <span data-testid="text" className={className}>
      {children}
    </span>
  ),
}));

// Mock MisskeyNote component
vi.mock("./MisskeyNote", () => ({
  // biome-ignore lint/style/useNamingConvention: Mock function
  // biome-ignore lint/suspicious/noExplicitAny: Mock function
  MisskeyNote: ({ note, origin }: { note: any; origin: string }) => (
    <div data-testid="misskey-note" data-note-id={note.id} data-origin={origin}>
      {note.text}
    </div>
  ),
}));

describe("ListTimelineContent", () => {
  const mockOrigin = "https://example.com";
  const mockToken = "test-token";
  const mockListId = "test-list-id";

  const mockUseListTimeline = vi.mocked(
    require("../hooks/useListTimeline").useListTimeline,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render notes correctly", () => {
    const mockNotes = [
      { id: "1", text: "Note 1" },
      { id: "2", text: "Note 2" },
    ];

    mockUseListTimeline.mockReturnValue({
      notes: mockNotes,
      error: null,
      hasMore: true,
      isLoading: false,
      fetchNotes: vi.fn(),
      retryFetch: vi.fn(),
    });

    render(
      <ListTimelineContent
        origin={mockOrigin}
        token={mockToken}
        listId={mockListId}
      />,
    );

    // Check if notes are rendered
    const noteElements = screen.getAllByTestId("misskey-note");
    expect(noteElements).toHaveLength(2);

    expect(noteElements[0]).toHaveAttribute("data-note-id", "1");
    expect(noteElements[0]).toHaveAttribute("data-origin", mockOrigin);
    expect(noteElements[0]).toHaveTextContent("Note 1");

    expect(noteElements[1]).toHaveAttribute("data-note-id", "2");
    expect(noteElements[1]).toHaveAttribute("data-origin", mockOrigin);
    expect(noteElements[1]).toHaveTextContent("Note 2");
  });

  it("should show loading spinner when loading", () => {
    mockUseListTimeline.mockReturnValue({
      notes: [],
      error: null,
      hasMore: true,
      isLoading: true,
      fetchNotes: vi.fn(),
      retryFetch: vi.fn(),
    });

    render(
      <ListTimelineContent
        origin={mockOrigin}
        token={mockToken}
        listId={mockListId}
      />,
    );

    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveTextContent("Loading...");
  });

  it("should display error message when there is an error", () => {
    const mockError = new Error("Test error message");
    const mockRetryFetch = vi.fn();

    mockUseListTimeline.mockReturnValue({
      notes: [],
      error: mockError,
      hasMore: false,
      isLoading: false,
      fetchNotes: vi.fn(),
      retryFetch: mockRetryFetch,
    });

    render(
      <ListTimelineContent
        origin={mockOrigin}
        token={mockToken}
        listId={mockListId}
      />,
    );

    // Check error message
    const errorText = screen.getByText(
      "Error loading list timeline: Test error message",
    );
    expect(errorText).toBeInTheDocument();
    expect(errorText).toHaveClass("text-center", "text-red-500");

    // Check retry button
    const retryButton = screen.getByText("Retry");
    expect(retryButton).toBeInTheDocument();

    // Test retry functionality
    retryButton.click();
    expect(mockRetryFetch).toHaveBeenCalledTimes(1);
  });

  it("should handle error without message", () => {
    const mockError = new Error("");
    const mockRetryFetch = vi.fn();

    mockUseListTimeline.mockReturnValue({
      notes: [],
      error: mockError,
      hasMore: false,
      isLoading: false,
      fetchNotes: vi.fn(),
      retryFetch: mockRetryFetch,
    });

    render(
      <ListTimelineContent
        origin={mockOrigin}
        token={mockToken}
        listId={mockListId}
      />,
    );

    const errorText = screen.getByText(
      "Error loading list timeline: Unknown error",
    );
    expect(errorText).toBeInTheDocument();
  });

  it("should call useListTimeline with correct parameters", () => {
    mockUseListTimeline.mockReturnValue({
      notes: [],
      error: null,
      hasMore: true,
      isLoading: false,
      fetchNotes: vi.fn(),
      retryFetch: vi.fn(),
    });

    render(
      <ListTimelineContent
        origin={mockOrigin}
        token={mockToken}
        listId={mockListId}
      />,
    );

    expect(mockUseListTimeline).toHaveBeenCalledWith(
      mockOrigin,
      mockToken,
      mockListId,
    );
  });

  it("should render empty state when no notes", () => {
    mockUseListTimeline.mockReturnValue({
      notes: [],
      error: null,
      hasMore: false,
      isLoading: false,
      fetchNotes: vi.fn(),
      retryFetch: vi.fn(),
    });

    render(
      <ListTimelineContent
        origin={mockOrigin}
        token={mockToken}
        listId={mockListId}
      />,
    );

    const noteElements = screen.queryAllByTestId("misskey-note");
    expect(noteElements).toHaveLength(0);

    const spinner = screen.queryByTestId("spinner");
    expect(spinner).not.toBeInTheDocument();
  });

  it("should render notes with virtualization", () => {
    const mockNotes = [
      { id: "1", text: "Note 1" },
      { id: "2", text: "Note 2" },
      { id: "3", text: "Note 3" },
    ];

    mockUseListTimeline.mockReturnValue({
      notes: mockNotes,
      error: null,
      hasMore: true,
      isLoading: false,
      fetchNotes: vi.fn(),
      retryFetch: vi.fn(),
    });

    render(
      <ListTimelineContent
        origin={mockOrigin}
        token={mockToken}
        listId={mockListId}
      />,
    );

    // Check if the virtualized container is rendered
    const virtualContainer = screen.getByTestId("misskey-note").closest("div");
    expect(virtualContainer).toHaveStyle({
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      transform: "translateY(0px)",
    });
  });

  it("should show loading spinner at the bottom when loading more", () => {
    const mockNotes = [{ id: "1", text: "Note 1" }];

    mockUseListTimeline.mockReturnValue({
      notes: mockNotes,
      error: null,
      hasMore: true,
      isLoading: true,
      fetchNotes: vi.fn(),
      retryFetch: vi.fn(),
    });

    render(
      <ListTimelineContent
        origin={mockOrigin}
        token={mockToken}
        listId={mockListId}
      />,
    );

    const noteElements = screen.getAllByTestId("misskey-note");
    expect(noteElements).toHaveLength(1);

    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeInTheDocument();
  });

  it("should handle different list IDs", () => {
    const differentListId = "different-list-id";

    mockUseListTimeline.mockReturnValue({
      notes: [],
      error: null,
      hasMore: true,
      isLoading: false,
      fetchNotes: vi.fn(),
      retryFetch: vi.fn(),
    });

    render(
      <ListTimelineContent
        origin={mockOrigin}
        token={mockToken}
        listId={differentListId}
      />,
    );

    expect(mockUseListTimeline).toHaveBeenCalledWith(
      mockOrigin,
      mockToken,
      differentListId,
    );
  });
});
