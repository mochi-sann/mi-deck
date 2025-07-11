import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmojiImg } from "./EmojiImg";

describe("EmojiImg", () => {
  it("should render emoji image when URL is provided", () => {
    const url = "https://example.com/emoji.png";
    const name = "test_emoji";

    render(<EmojiImg name={name} url={url} />);

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", url);
    expect(img).toHaveAttribute("alt", name);
    expect(img).toHaveClass("mfm-customEmoji", "inline", "h-[1.2em]", "w-auto");
  });

  it("should render text fallback when URL is null", () => {
    const name = "test_emoji";

    render(<EmojiImg name={name} url={null} />);

    const text = screen.getByText(":test_emoji:");
    expect(text).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("should render text fallback when URL is undefined", () => {
    const name = "test_emoji";

    render(<EmojiImg name={name} url={undefined} />);

    const text = screen.getByText(":test_emoji:");
    expect(text).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("should render text fallback when URL is empty string", () => {
    const name = "test_emoji";

    render(<EmojiImg name={name} url="" />);

    const text = screen.getByText(":test_emoji:");
    expect(text).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("should handle special characters in emoji name", () => {
    const url = "https://example.com/emoji.png";
    const name = "test_emoji_123";

    render(<EmojiImg name={name} url={url} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", name);
  });

  it("should handle empty emoji name", () => {
    const url = "https://example.com/emoji.png";
    const name = "";

    render(<EmojiImg name={name} url={url} />);

    const img = screen.getByAltText("");
    expect(img).toHaveAttribute("alt", name);
  });

  it("should render text fallback with empty name", () => {
    const name = "";

    render(<EmojiImg name={name} url={null} />);

    const text = screen.getByText("::");
    expect(text).toBeInTheDocument();
  });
});
