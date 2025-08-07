import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  MisskeyServerConnection,
  TimelineConfig,
} from "@/lib/storage/types";
import { SwitchTimeLineType } from "./SwitchTimeLineType";

// Mock components
vi.mock("./HomeTimelineContent", () => ({
  // biome-ignore lint/style/useNamingConvention: Mock component
  HomeTimelineContent: ({
    origin,
    token,
    type,
  }: {
    origin: string;
    token: string;
    type: string;
  }) => (
    <div
      data-testid="home-timeline-content"
      data-origin={origin}
      data-token={token}
      data-type={type}
    >
      Home Timeline Content - {type}
    </div>
  ),
}));

vi.mock("./ListTimelineContent", () => ({
  // biome-ignore lint/style/useNamingConvention: Mock component
  ListTimelineContent: ({
    origin,
    token,
    listId,
  }: {
    origin: string;
    token: string;
    listId: string;
  }) => (
    <div
      data-testid="list-timeline-content"
      data-origin={origin}
      data-token={token}
      data-list-id={listId}
    >
      List Timeline Content - {listId}
    </div>
  ),
}));

describe("SwitchTimeLineType", () => {
  const mockServer: MisskeyServerConnection = {
    id: "server-1",
    origin: "https://example.com",
    accessToken: "test-token",
    isActive: true,
    userInfo: {
      id: "user-1",
      username: "testuser",
      name: "Test User",
      avatarUrl: "https://example.com/avatar.jpg",
    },
    serverInfo: {
      name: "Test Server",
      version: "1.0.0",
      description: "Test server",
      iconUrl: "https://example.com/icon.png",
    },
    createdAt: new Date("2023-01-01T00:00:00.000Z"),
    updatedAt: new Date("2023-01-01T00:00:00.000Z"),
  };

  const createMockTimeline = (
    type: TimelineConfig["type"],
    settings?: TimelineConfig["settings"],
  ): TimelineConfig & { server: MisskeyServerConnection } => ({
    id: "timeline-1",
    name: "Test Timeline",
    serverId: "server-1",
    type,
    order: 1,
    isVisible: true,
    settings,
    createdAt: new Date("2023-01-01T00:00:00.000Z"),
    updatedAt: new Date("2023-01-01T00:00:00.000Z"),
    server: mockServer,
  });

  it("should render home timeline", () => {
    const timeline = createMockTimeline("home");

    render(<SwitchTimeLineType timeline={timeline} />);

    const homeTimeline = screen.getByTestId("home-timeline-content");
    expect(homeTimeline).toBeInTheDocument();
    expect(homeTimeline).toHaveAttribute("data-origin", "https://example.com");
    expect(homeTimeline).toHaveAttribute("data-token", "test-token");
    expect(homeTimeline).toHaveAttribute("data-type", "home");
  });

  it("should render local timeline", () => {
    const timeline = createMockTimeline("local");

    render(<SwitchTimeLineType timeline={timeline} />);

    const localTimeline = screen.getByTestId("home-timeline-content");
    expect(localTimeline).toBeInTheDocument();
    expect(localTimeline).toHaveAttribute("data-origin", "https://example.com");
    expect(localTimeline).toHaveAttribute("data-token", "test-token");
    expect(localTimeline).toHaveAttribute("data-type", "local");
  });

  it("should render social timeline", () => {
    const timeline = createMockTimeline("social");

    render(<SwitchTimeLineType timeline={timeline} />);

    const socialTimeline = screen.getByTestId("home-timeline-content");
    expect(socialTimeline).toBeInTheDocument();
    expect(socialTimeline).toHaveAttribute(
      "data-origin",
      "https://example.com",
    );
    expect(socialTimeline).toHaveAttribute("data-token", "test-token");
    expect(socialTimeline).toHaveAttribute("data-type", "local");
  });

  it("should render global timeline", () => {
    const timeline = createMockTimeline("global");

    render(<SwitchTimeLineType timeline={timeline} />);

    const globalTimeline = screen.getByTestId("home-timeline-content");
    expect(globalTimeline).toBeInTheDocument();
    expect(globalTimeline).toHaveAttribute(
      "data-origin",
      "https://example.com",
    );
    expect(globalTimeline).toHaveAttribute("data-token", "test-token");
    expect(globalTimeline).toHaveAttribute("data-type", "global");
  });

  it("should render list timeline with listId", () => {
    const timeline = createMockTimeline("list", { listId: "test-list-id" });

    render(<SwitchTimeLineType timeline={timeline} />);

    const listTimeline = screen.getByTestId("list-timeline-content");
    expect(listTimeline).toBeInTheDocument();
    expect(listTimeline).toHaveAttribute("data-origin", "https://example.com");
    expect(listTimeline).toHaveAttribute("data-token", "test-token");
    expect(listTimeline).toHaveAttribute("data-list-id", "test-list-id");
  });

  it("should show error message when list timeline has no listId", () => {
    const timeline = createMockTimeline("list");

    render(<SwitchTimeLineType timeline={timeline} />);

    const errorMessage = screen.getByText(
      "リストIDが設定されていません。タイムラインを再作成してください。",
    );
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass("text-center", "text-red-500");

    // Should not render list timeline content
    const listTimeline = screen.queryByTestId("list-timeline-content");
    expect(listTimeline).not.toBeInTheDocument();
  });

  it("should show error message when list timeline has empty listId", () => {
    const timeline = createMockTimeline("list", { listId: "" });

    render(<SwitchTimeLineType timeline={timeline} />);

    const errorMessage = screen.getByText(
      "リストIDが設定されていません。タイムラインを再作成してください。",
    );
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass("text-center", "text-red-500");

    // Should not render list timeline content
    const listTimeline = screen.queryByTestId("list-timeline-content");
    expect(listTimeline).not.toBeInTheDocument();
  });

  it("should handle server without access token", () => {
    const serverWithoutToken = {
      ...mockServer,
      accessToken: undefined,
    };
    const timeline = {
      ...createMockTimeline("home"),
      server: serverWithoutToken,
    };

    render(<SwitchTimeLineType timeline={timeline} />);

    const homeTimeline = screen.getByTestId("home-timeline-content");
    expect(homeTimeline).toBeInTheDocument();
    expect(homeTimeline).toHaveAttribute("data-origin", "https://example.com");
    expect(homeTimeline).toHaveAttribute("data-token", "");
    expect(homeTimeline).toHaveAttribute("data-type", "home");
  });

  it("should render default case for unknown timeline type", () => {
    // biome-ignore lint/suspicious/noExplicitAny: Test case for unknown type
    const timeline = createMockTimeline("unknown" as any);

    render(<SwitchTimeLineType timeline={timeline} />);

    const defaultMessage = screen.getByText(
      "No matching timeline type: unknown",
    );
    expect(defaultMessage).toBeInTheDocument();
  });

  it("should handle list timeline with other settings", () => {
    const timeline = createMockTimeline("list", {
      listId: "test-list-id",
      withReplies: true,
      withFiles: false,
      excludeNsfw: true,
    });

    render(<SwitchTimeLineType timeline={timeline} />);

    const listTimeline = screen.getByTestId("list-timeline-content");
    expect(listTimeline).toBeInTheDocument();
    expect(listTimeline).toHaveAttribute("data-list-id", "test-list-id");
  });

  it("should handle channel timeline type", () => {
    // biome-ignore lint/suspicious/noExplicitAny: Test case for channel type
    const timeline = createMockTimeline("channel" as any);

    render(<SwitchTimeLineType timeline={timeline} />);

    const defaultMessage = screen.getByText(
      "No matching timeline type: channel",
    );
    expect(defaultMessage).toBeInTheDocument();
  });
});
