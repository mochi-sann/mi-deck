import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MfmText } from "./MfmText";

// Mock the react-mfm library
vi.mock("@mi-deck/react-mfm", () => ({
  default: ({
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
  ),
}));

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
    it("should apply word-break classes for long text", () => {
      const longText = "VeryLongWordWithoutSpaces".repeat(50);

      const { container } = render(<MfmText text={longText} />);

      // Find the span wrapper that should have word-break classes
      const spanElement = container.querySelector("span.break-words");
      expect(spanElement).toBeInTheDocument();
      expect(spanElement).toHaveClass("break-words");
      expect(spanElement).toHaveClass("overflow-wrap-anywhere");
      expect(spanElement).toHaveClass("break-all");
      expect(spanElement).toHaveClass("max-w-full");
      expect(spanElement).toHaveClass("inline-block");
    });

    it("should apply word-break classes for long URLs", () => {
      const longUrl = "https://example.com/" + "very-long-path/".repeat(20);

      const { container } = render(<MfmText text={longUrl} />);

      const spanElement = container.querySelector("span.break-words");
      expect(spanElement).toBeInTheDocument();
      expect(spanElement).toHaveClass("break-words");
      expect(spanElement).toHaveClass("overflow-wrap-anywhere");
      expect(spanElement).toHaveClass("break-all");
    });

    it("should handle Japanese mixed with URLs", () => {
      const mixedText =
        "さくらインターネット株式会社https://www.sakura.ad.jp/corporate/information/newsreleases/2025/07/28/1968220370/について";

      const { container } = render(<MfmText text={mixedText} />);

      const spanElement = container.querySelector("span.break-all");
      expect(spanElement).toBeInTheDocument();
      expect(spanElement).toHaveClass("break-all");

      const textContent = screen.getByTestId("mfm-text-content");
      expect(textContent).toHaveTextContent(mixedText);
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
