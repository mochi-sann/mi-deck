import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CustomEmoji, CustomEmojiStr } from "./CustomEmoji";

// Mock dependencies
vi.mock("./CustomEmojiInternal", () => ({
  CustomEmojiInternal: ({
    name,
    host,
    emojis,
  }: {
    name: string;
    host: string;

    emojis?: any;
  }) => (
    <div data-testid="custom-emoji-internal">
      <span data-testid="emoji-name">{name}</span>
      <span data-testid="emoji-host">{host}</span>
      <span data-testid="emoji-emojis">{JSON.stringify(emojis)}</span>
    </div>
  ),
}));

vi.mock("../contexts/CustomEmojiContext", () => ({
  CustomEmojiCtx: {
    Provider: ({
      children,
      value,
    }: {
      children: React.ReactNode;

      value: any;
    }) => (
      <div data-testid="emoji-context" data-value={JSON.stringify(value)}>
        {children}
      </div>
    ),
  },
}));

describe("CustomEmoji", () => {
  it("should render with host and emojis context", () => {
    const name = "test_emoji";
    const host = "misskey.example.com";

    const emojis = { test_emoji: "https://example.com/emoji.png" };

    render(<CustomEmoji name={name} host={host} emojis={emojis} />);

    const context = screen.getByTestId("emoji-context");
    expect(context).toBeInTheDocument();

    const contextValue = JSON.parse(context.getAttribute("data-value") || "{}");
    expect(contextValue.host).toBe(host);
    expect(contextValue.emojis).toEqual(emojis);

    expect(screen.getByTestId("emoji-name")).toHaveTextContent(name);
    expect(screen.getByTestId("emoji-host")).toHaveTextContent(host);
  });

  it("should render with only host", () => {
    const name = "test_emoji";
    const host = "misskey.example.com";

    render(<CustomEmoji name={name} host={host} />);

    const context = screen.getByTestId("emoji-context");
    expect(context).toBeInTheDocument();

    const contextValue = JSON.parse(context.getAttribute("data-value") || "{}");
    expect(contextValue.host).toBe(host);
    expect(contextValue.emojis).toBeUndefined();
  });

  it("should render with only emojis", () => {
    const name = "test_emoji";

    const emojis = { test_emoji: "https://example.com/emoji.png" };

    render(<CustomEmoji name={name} emojis={emojis} />);

    const context = screen.getByTestId("emoji-context");
    expect(context).toBeInTheDocument();

    const contextValue = JSON.parse(context.getAttribute("data-value") || "{}");
    expect(contextValue.host).toBeNull();
    expect(contextValue.emojis).toEqual(emojis);
  });

  it("should render without context when no host or emojis", () => {
    const name = "test_emoji";

    render(<CustomEmoji name={name} />);

    expect(screen.queryByTestId("emoji-context")).not.toBeInTheDocument();
    expect(screen.getByTestId("custom-emoji-internal")).toBeInTheDocument();
    expect(screen.getByTestId("emoji-name")).toHaveTextContent(name);
    expect(screen.getByTestId("emoji-host")).toHaveTextContent("");
  });

  it("should handle empty host", () => {
    const name = "test_emoji";
    const host = "";

    const emojis = { test_emoji: "https://example.com/emoji.png" };

    render(<CustomEmoji name={name} host={host} emojis={emojis} />);

    const context = screen.getByTestId("emoji-context");
    const contextValue = JSON.parse(context.getAttribute("data-value") || "{}");
    expect(contextValue.host).toBeNull();
    expect(contextValue.emojis).toEqual(emojis);
  });
});

describe("CustomEmojiStr", () => {
  it("should render text with embedded emojis", () => {
    const text = "Hello :smile: world :heart:";
    const host = "misskey.example.com";
    const emojis = {
      smile: "https://example.com/smile.png",
      heart: "https://example.com/heart.png",
    };

    render(<CustomEmojiStr text={text} host={host} emojis={emojis} />);

    // Check for text fragments
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
    expect(screen.getByText(/world/)).toBeInTheDocument();

    // Check for emoji components
    const emojiComponents = screen.getAllByTestId("custom-emoji-internal");
    expect(emojiComponents).toHaveLength(2);

    // Check emoji names
    const emojiNames = screen.getAllByTestId("emoji-name");
    expect(emojiNames[0]).toHaveTextContent("smile");
    expect(emojiNames[1]).toHaveTextContent("heart");
  });

  it("should handle text without emojis", () => {
    const text = "Hello world";
    const host = "misskey.example.com";

    render(<CustomEmojiStr text={text} host={host} />);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(
      screen.queryByTestId("custom-emoji-internal"),
    ).not.toBeInTheDocument();
  });

  it("should handle empty text", () => {
    const text = "";
    const host = "misskey.example.com";

    render(<CustomEmojiStr text={text} host={host} />);

    expect(
      screen.queryByTestId("custom-emoji-internal"),
    ).not.toBeInTheDocument();
  });

  it("should handle text with only emojis", () => {
    const text = ":smile::heart:";
    const host = "misskey.example.com";

    render(<CustomEmojiStr text={text} host={host} />);

    const emojiComponents = screen.getAllByTestId("custom-emoji-internal");
    expect(emojiComponents).toHaveLength(2);

    const emojiNames = screen.getAllByTestId("emoji-name");
    expect(emojiNames[0]).toHaveTextContent("smile");
    expect(emojiNames[1]).toHaveTextContent("heart");
  });

  it("should handle text with consecutive colons", () => {
    const text = "Hello :: world";
    const host = "misskey.example.com";

    render(<CustomEmojiStr text={text} host={host} />);

    expect(screen.getByText(/Hello/)).toBeInTheDocument();
    expect(screen.getByText(/world/)).toBeInTheDocument();

    const emojiComponents = screen.getAllByTestId("custom-emoji-internal");
    expect(emojiComponents).toHaveLength(1);

    const emojiNames = screen.getAllByTestId("emoji-name");
    expect(emojiNames[0]).toHaveTextContent("");
  });
});
