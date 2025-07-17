import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserTimelineContent } from "./UserTimelineContent";

// Mock dependencies
const mockUseUserTimeline = vi.hoisted(() => vi.fn());
vi.mock("../hooks/useUserTimeline", () => ({
  useUserTimeline: mockUseUserTimeline,
}));

const mockUseVirtualizer = vi.hoisted(() =>
  vi.fn(() => ({
    getVirtualItems: vi.fn(() => []),
    getTotalSize: vi.fn(() => 0),
    measureElement: vi.fn(),
  })),
);
vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: mockUseVirtualizer,
}));

vi.mock("./MisskeyNote", () => ({
  // biome-ignore lint/style/useNamingConvention: Mock component name
  MisskeyNote: () => <div data-testid="misskey-note">Mocked Note</div>,
}));

vi.mock("@/components/ui/button", () => ({
  // biome-ignore lint/style/useNamingConvention: Mock component name
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/spinner", () => ({
  // biome-ignore lint/style/useNamingConvention: Mock component name
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

vi.mock("@/components/ui/text", () => ({
  default: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <span className={className}>{children}</span>,
}));

describe("UserTimelineContent", () => {
  const defaultProps = {
    origin: "https://example.com",
    token: "test-token",
    userId: "user123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display error message when there is an error", () => {
    mockUseUserTimeline.mockReturnValue({
      notes: [],
      error: new Error("Failed to fetch"),
      hasMore: true,
      isLoading: false,
      loadMore: vi.fn(),
      retryFetch: vi.fn(),
    });

    render(<UserTimelineContent {...defaultProps} />);

    expect(screen.getByText(/Error loading user notes/)).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("should display empty state when no notes are found", () => {
    mockUseUserTimeline.mockReturnValue({
      notes: [],
      error: null,
      hasMore: false,
      isLoading: false,
      loadMore: vi.fn(),
      retryFetch: vi.fn(),
    });

    render(<UserTimelineContent {...defaultProps} />);

    expect(
      screen.getByText("このユーザーの投稿は見つかりませんでした。"),
    ).toBeInTheDocument();
  });

  it("should display loading spinner when loading", () => {
    mockUseUserTimeline.mockReturnValue({
      notes: [{ id: "1", text: "Test note" }],
      error: null,
      hasMore: true,
      isLoading: true,
      loadMore: vi.fn(),
      retryFetch: vi.fn(),
    });

    render(<UserTimelineContent {...defaultProps} />);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("should display notes when loaded successfully", () => {
    const mockNotes = [
      { id: "1", text: "Test note 1" },
      { id: "2", text: "Test note 2" },
    ];

    mockUseUserTimeline.mockReturnValue({
      notes: mockNotes,
      error: null,
      hasMore: false,
      isLoading: false,
      loadMore: vi.fn(),
      retryFetch: vi.fn(),
    });

    // Mock useVirtualizer to return virtual items
    const mockGetVirtualItems = vi.fn(() => [
      { index: 0, start: 0, end: 100, size: 100, key: 0 },
      { index: 1, start: 100, end: 200, size: 100, key: 1 },
    ]);
    const mockGetTotalSize = vi.fn(() => 200);

    mockUseVirtualizer.mockReturnValue({
      getVirtualItems: mockGetVirtualItems,
      getTotalSize: mockGetTotalSize,
      measureElement: vi.fn(),
    });

    render(<UserTimelineContent {...defaultProps} />);

    expect(screen.getAllByTestId("misskey-note")).toHaveLength(2);
  });
});
