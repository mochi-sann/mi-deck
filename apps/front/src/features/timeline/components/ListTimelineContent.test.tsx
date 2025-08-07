import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ListTimelineContent } from "./ListTimelineContent";

// Mock @tanstack/react-virtual
const mockGetVirtualItems = vi.fn();
const mockGetTotalSize = vi.fn();
const mockMeasureElement = vi.fn();

vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: vi.fn(() => ({
    getVirtualItems: mockGetVirtualItems,
    getTotalSize: mockGetTotalSize,
    measureElement: mockMeasureElement,
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
    <div
      data-testid="misskey-note"
      data-note-id={note?.id}
      data-origin={origin}
    >
      {note?.text}
    </div>
  ),
}));

// Import the hook directly for type checking
import { useListTimeline } from "../hooks/useListTimeline";

// Helper function to create mock notes
const createMockNote = (id: string, text: string, userId = "user1") => ({
  id,
  text,
  createdAt: "2023-01-01T00:00:00.000Z",
  userId,
  user: {
    id: userId,
    name: `User ${userId}`,
    username: userId,
    host: null,
    avatarUrl: `https://example.com/avatar${userId}.png`,
    avatarBlurhash: null,
    avatarDecorations: [],
    isBot: false,
    isCat: false,
    emojis: {},
    onlineStatus: "unknown" as const,
    badgeRoles: [],
  },
  visibility: "public" as const,
  renoteCount: 0,
  repliesCount: 0,
  reactionAcceptance: null,
  reactions: {},
  reactionEmojis: {},
  emojis: {},
});

describe("ListTimelineContent", () => {
  const mockOrigin = "https://example.com";
  const mockToken = "test-token";
  const mockListId = "test-list-id";

  const mockUseListTimeline = vi.mocked(useListTimeline);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset virtual items mock with default empty state
    mockGetVirtualItems.mockReturnValue([]);
    mockGetTotalSize.mockReturnValue(0);
    mockMeasureElement.mockReset();
  });

  it("should render notes correctly", () => {
    const mockNotes = [
      createMockNote("1", "Note 1", "user1"),
      createMockNote("2", "Note 2", "user2"),
    ];

    // Mock virtual items for 2 notes
    mockGetVirtualItems.mockReturnValue([
      { index: 0, start: 0, size: 100 },
      { index: 1, start: 100, size: 100 },
    ]);
    mockGetTotalSize.mockReturnValue(200);

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
    // Mock empty virtual items for no notes
    mockGetVirtualItems.mockReturnValue([]);
    mockGetTotalSize.mockReturnValue(0);

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

    // No need for virtual items setup as error state doesn't use virtualization
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

    // No need for virtual items setup as error state doesn't use virtualization
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
    // Set up default empty virtual items
    mockGetVirtualItems.mockReturnValue([]);
    mockGetTotalSize.mockReturnValue(0);

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
    // Mock empty virtual items for no notes
    mockGetVirtualItems.mockReturnValue([]);
    mockGetTotalSize.mockReturnValue(0);

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
      createMockNote("1", "Note 1"),
      createMockNote("2", "Note 2"),
      createMockNote("3", "Note 3"),
    ];

    // Mock virtual items for 3 notes (showing first 2)
    mockGetVirtualItems.mockReturnValue([
      { index: 0, start: 0, size: 100 },
      { index: 1, start: 100, size: 100 },
    ]);
    mockGetTotalSize.mockReturnValue(300);

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

    // Check if notes are rendered (only the virtualized ones)
    const noteElements = screen.getAllByTestId("misskey-note");
    expect(noteElements).toHaveLength(2);

    // Check that the first note is rendered correctly
    expect(noteElements[0]).toHaveAttribute("data-note-id", "1");
    expect(noteElements[0]).toHaveTextContent("Note 1");
  });

  it("should show loading spinner at the bottom when loading more", () => {
    const mockNotes = [createMockNote("1", "Note 1")];

    // Mock virtual items for 1 note
    mockGetVirtualItems.mockReturnValue([{ index: 0, start: 0, size: 100 }]);
    mockGetTotalSize.mockReturnValue(100);

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

    // Set up default empty virtual items
    mockGetVirtualItems.mockReturnValue([]);
    mockGetTotalSize.mockReturnValue(0);

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
