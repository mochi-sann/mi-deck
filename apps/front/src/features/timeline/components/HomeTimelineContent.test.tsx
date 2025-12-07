import { useVirtualizer } from "@tanstack/react-virtual";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTimeline } from "../hooks/useTimeline";
import { HomeTimelineContent } from "./HomeTimelineContent";

type MockNote = { id: string };

type UseTimelineReturn = {
  notes: MockNote[];
  error: Error | null;
  hasMore: boolean;
  isLoading: boolean;
  fetchNotes: (cursor?: string) => void;
  retryFetch: () => void;
};

vi.mock("../hooks/useTimeline", () => ({
  useTimeline: vi.fn(),
}));

vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: vi.fn(),
}));

vi.mock("./MisskeyNote", () => ({
  // biome-ignore lint/style/useNamingConvention: 実際のエクスポート名に合わせてPascalCaseを維持
  MisskeyNote: ({ note }: { note: MockNote }) => (
    <div data-testid="note" data-note-id={note.id}>
      note-{note.id}
    </div>
  ),
}));

const mockUseTimeline = useTimeline as unknown as vi.Mock;
const mockUseVirtualizer = useVirtualizer as unknown as vi.Mock;

const createTimelineState = (
  overrides: Partial<UseTimelineReturn> = {},
): UseTimelineReturn => ({
  notes: [],
  error: null,
  hasMore: false,
  isLoading: false,
  fetchNotes: vi.fn(),
  retryFetch: vi.fn(),
  ...overrides,
});

type VirtualItem = {
  index: number;
  start: number;
  end: number;
  size: number;
};

const createVirtualizer = (items: VirtualItem[]) => {
  const virtualizer = {
    getVirtualItems: vi.fn(() => items),
    getTotalSize: vi.fn(() => items.length * 100),
    measureElement: vi.fn(),
  };
  mockUseVirtualizer.mockReturnValue(virtualizer);
  return virtualizer;
};

describe("HomeTimelineContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ScrollArea ビューポート内にノートを描画する", () => {
    createVirtualizer([{ index: 0, start: 0, end: 100, size: 100 }]);

    const timelineState = createTimelineState({
      notes: [{ id: "1" }],
    });
    mockUseTimeline.mockReturnValue(timelineState);

    render(
      <HomeTimelineContent
        origin="https://example.com"
        token="token"
        type="home"
      />,
    );

    expect(screen.getByTestId("note")).toHaveAttribute("data-note-id", "1");
    expect(screen.getByTestId("virtual-timeline")).toBeDefined();
  });

  it("末尾までスクロールした場合に fetchNotes を呼び出す", async () => {
    createVirtualizer([
      { index: 0, start: 0, end: 120, size: 120 },
      { index: 1, start: 120, end: 240, size: 200 },
    ]);

    const timelineState = createTimelineState({
      notes: [{ id: "1" }, { id: "2" }],
      hasMore: true,
      isLoading: false,
    });
    mockUseTimeline.mockReturnValue(timelineState);

    render(
      <HomeTimelineContent
        origin="https://example.com"
        token="token"
        type="home"
      />,
    );

    await waitFor(() => {
      expect(timelineState.fetchNotes).toHaveBeenCalledWith("2");
    });
  });
});
