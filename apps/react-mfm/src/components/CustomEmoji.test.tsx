import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CustomEmoji, { CustomEmojiCtx } from "./CustomEmoji";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("CustomEmoji", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
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

  it("fetches emoji from host when not cached", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ url: "https://remote.com/emoji.png" }),
    });

    render(
      <Provider>
        <CustomEmoji name="test" host="remote.com" />
      </Provider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "https://remote.com/api/emoji?name=test",
      );
    });
  });

  it("handles fetch error gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <Provider>
        <CustomEmoji name="test" host="remote.com" />
      </Provider>,
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch emoji:",
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });

  it("prefers local emojis over host", () => {
    const emojis = { test: "https://local.com/test.png" };

    render(
      <Provider>
        <CustomEmoji name="test" host="remote.com" emojis={emojis} />
      </Provider>,
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://local.com/test.png");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
