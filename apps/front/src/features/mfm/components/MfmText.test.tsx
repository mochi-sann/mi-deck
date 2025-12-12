import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MfmText } from "./MfmText";

// Mock the react-mfm library
vi.mock("@mi-deck/react-mfm", () => {
  const MockMfm = ({
    text,
    host,
    emojis,
  }: {
    text: string;
    host?: string;
    emojis?: Record<string, string>;
  }) => (
    <div data-testid="mfm-component">
      <span data-testid="mfm-text-content">{text}</span>
      <span data-testid="mfm-host">{host}</span>
      <span data-testid="mfm-emojis">{JSON.stringify(emojis)}</span>
    </div>
  );

  return {
    default: MockMfm,

    Mfm: MockMfm,
  };
});

describe("MfmText", () => {
  it("should render basic text", () => {
    const text = "Hello world";

    render(<MfmText text={text} />);

    const textContent = screen.getByTestId("mfm-text-content");
    expect(textContent).toHaveTextContent(text);
  });

  it("should pass host and emojis to Mfm component", () => {
    const text = "Hello :smile:";
    const host = "example.com";
    const emojis = { smile: "https://example.com/smile.png" };

    render(<MfmText text={text} host={host} emojis={emojis} />);

    const hostElement = screen.getByTestId("mfm-host");
    expect(hostElement).toHaveTextContent(host);

    const emojisElement = screen.getByTestId("mfm-emojis");
    expect(emojisElement).toHaveTextContent(JSON.stringify(emojis));
  });

  it("should handle undefined host and emojis", () => {
    const text = "Hello world";

    render(<MfmText text={text} />);

    const hostElement = screen.getByTestId("mfm-host");
    expect(hostElement).toBeEmptyDOMElement();

    const emojisElement = screen.getByTestId("mfm-emojis");
    expect(emojisElement).toBeEmptyDOMElement();
  });

  describe("Text Wrapping", () => {
    it("should apply base word-break classes for English text", () => {
      const longText = "VeryLongWordWithoutSpaces".repeat(50);

      const { container } = render(<MfmText text={longText} />);

      // Find the span wrapper that should have word-break classes
      const spanElement = container.querySelector("span.break-words");
      expect(spanElement).toBeInTheDocument();
      expect(spanElement).toHaveClass("break-words");
      expect(spanElement).toHaveClass("overflow-wrap-anywhere");
      expect(spanElement).toHaveClass("max-w-full");
      // English text should NOT have break-all
      expect(spanElement).not.toHaveClass("break-all");
    });

    it("should apply base word-break classes for English URLs", () => {
      const longUrl = "https://example.com/" + "very-long-path/".repeat(20);

      const { container } = render(<MfmText text={longUrl} />);

      const spanElement = container.querySelector("span.break-words");
      expect(spanElement).toBeInTheDocument();
      expect(spanElement).toHaveClass("break-words");
      expect(spanElement).toHaveClass("overflow-wrap-anywhere");
      // English URLs should NOT have break-all
      expect(spanElement).not.toHaveClass("break-all");
    });

    it("should apply break-all for Japanese mixed with URLs", () => {
      const mixedText =
        "さくらインターネット株式会社https://www.sakura.ad.jp/corporate/information/newsreleases/2025/07/28/1968220370/について";

      const { container } = render(<MfmText text={mixedText} />);

      // Find any span with break-all class
      const spanElement = container.querySelector("span");
      expect(spanElement).toBeInTheDocument();
      expect(spanElement).toHaveClass("break-all");
      expect(spanElement).toHaveClass("break-words");
      expect(spanElement).toHaveClass("overflow-wrap-anywhere");

      const textContent = screen.getByTestId("mfm-text-content");
      expect(textContent).toHaveTextContent(mixedText);
    });

    it("should apply break-all for Japanese text", () => {
      const japaneseText = "こんにちは世界";

      const { container } = render(<MfmText text={japaneseText} />);

      const spanElement = container.querySelector("span.break-all");
      expect(spanElement).toBeInTheDocument();
      expect(spanElement).toHaveClass("break-all");
    });

    it("should wrap span in Fragment", () => {
      const text = "Test text";

      const { container } = render(<MfmText text={text} />);

      // The span should be directly inside a React Fragment (no extra wrapper)
      const span = container.querySelector("span.break-words");
      expect(span).toBeInTheDocument();
    });
  });
});
