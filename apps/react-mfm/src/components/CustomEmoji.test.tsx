import { render, screen } from "@testing-library/react";
import { Provider } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CustomEmoji, { CustomEmojiCtx } from "./CustomEmoji";

describe("CustomEmoji", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders emoji name when no URL is provided", () => {
    render(
      <Provider>
        <CustomEmoji name="test" />
      </Provider>,
    );

    expect(screen.getByText(":test:")).toBeInTheDocument();
  });

  it("renders local emoji when emojis prop is provided", () => {
    const emojis = { test: "https://example.com/test.png" };

    render(
      <Provider>
        <CustomEmoji name="test" emojis={emojis} />
      </Provider>,
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/test.png");
    expect(img).toHaveAttribute("alt", "test");
    expect(img).toHaveClass("mfm-customEmoji");
  });

  it("uses CustomEmojiCtx when provided", () => {
    const emojis = { test: "https://context.com/test.png" };

    render(
      <Provider>
        <CustomEmojiCtx.Provider value={{ host: "example.com", emojis }}>
          <CustomEmoji name="test" />
        </CustomEmojiCtx.Provider>
      </Provider>,
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://context.com/test.png");
  });

  it("renders emoji name when emoji not found in provided emojis", () => {
    const emojis = { other: "https://example.com/other.png" };

    render(
      <Provider>
        <CustomEmoji name="test" emojis={emojis} />
      </Provider>,
    );

    expect(screen.getByText(":test:")).toBeInTheDocument();
  });

  it("prefers props emojis over context when both are provided", () => {
    const contextEmojis = { test: "https://context.com/test.png" };
    const propEmojis = { test: "https://props.com/test.png" };

    render(
      <Provider>
        <CustomEmojiCtx.Provider
          value={{ host: "example.com", emojis: contextEmojis }}
        >
          <CustomEmoji name="test" emojis={propEmojis} />
        </CustomEmojiCtx.Provider>
      </Provider>,
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://props.com/test.png");
  });

  it("handles host prop without emojis gracefully", () => {
    render(
      <Provider>
        <CustomEmoji name="test" host="remote.com" />
      </Provider>,
    );

    expect(screen.getByText(":test:")).toBeInTheDocument();
  });

  it("renders emoji name when emoji URL is null", () => {
    // biome-ignore lint/suspicious/noExplicitAny: テストなので無視
    const emojis = { test: null as any };

    render(
      <Provider>
        <CustomEmoji name="test" emojis={emojis} />
      </Provider>,
    );

    expect(screen.getByText(":test:")).toBeInTheDocument();
  });

  it("renders emoji name when emoji URL is undefined", () => {
    // biome-ignore lint/suspicious/noExplicitAny: テストなので無視
    const emojis = { test: undefined as any };

    render(
      <Provider>
        <CustomEmoji name="test" emojis={emojis} />
      </Provider>,
    );

    expect(screen.getByText(":test:")).toBeInTheDocument();
  });
});
