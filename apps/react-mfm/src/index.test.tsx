import { render, screen } from "@testing-library/react";
import { Provider } from "jotai";
import { describe, expect, it } from "vitest";
import Mfm, { MfmSimple } from "./index";

describe("Mfm", () => {
  it("renders plain text", () => {
    render(
      <Provider>
        <Mfm text="Hello World" />
      </Provider>,
    );

    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders bold text", () => {
    render(
      <Provider>
        <Mfm text="**bold text**" />
      </Provider>,
    );

    const boldElement = screen.getByText("bold text");
    expect(boldElement.tagName).toBe("B");
  });

  it("renders italic text", () => {
    render(
      <Provider>
        <Mfm text="*italic text*" />
      </Provider>,
    );

    const italicElement = screen.getByText("italic text");
    expect(italicElement.tagName).toBe("I");
  });

  it("renders strikethrough text", () => {
    render(
      <Provider>
        <Mfm text="~~strikethrough~~" />
      </Provider>,
    );

    const strikeElement = screen.getByText("strikethrough");
    expect(strikeElement.tagName).toBe("DEL");
  });

  it("renders inline code", () => {
    render(
      <Provider>
        <Mfm text="`console.log('hello')`" />
      </Provider>,
    );

    const codeElement = screen.getByText("console.log('hello')");
    expect(codeElement.tagName).toBe("CODE");
  });

  it("renders hashtags", () => {
    render(
      <Provider>
        <Mfm text="#hashtag" />
      </Provider>,
    );

    expect(screen.getByText("#hashtag")).toBeInTheDocument();
  });

  it("renders mentions", () => {
    render(
      <Provider>
        <Mfm text="@username" />
      </Provider>,
    );

    expect(screen.getByText("@username")).toBeInTheDocument();
  });

  it("renders links", () => {
    render(
      <Provider>
        <Mfm text="https://example.com" />
      </Provider>,
    );

    const linkElement = screen.getByRole("link");
    expect(linkElement).toHaveAttribute("href", "https://example.com");
    expect(linkElement).toHaveTextContent("https://example.com");
  });

  it("renders custom emoji", () => {
    const emojis = { smile: "https://example.com/smile.png" };

    render(
      <Provider>
        <Mfm text=":smile:" emojis={emojis} />
      </Provider>,
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/smile.png");
    expect(img).toHaveAttribute("alt", "smile");
  });

  it("renders nested formatting", () => {
    render(
      <Provider>
        <Mfm text="**bold *italic* text**" />
      </Provider>,
    );

    const boldElement = screen.getByText("bold text", { exact: false });
    expect(boldElement.tagName).toBe("B");

    const italicElement = screen.getByText("italic");
    expect(italicElement.tagName).toBe("I");
  });

  it("handles plain mode", () => {
    render(
      <Provider>
        <Mfm text="**should not be bold**" plain />
      </Provider>,
    );

    const textElement = screen.getByText("**should not be bold**");
    expect(textElement).toBeInTheDocument();
    expect(textElement.tagName).toBe("SPAN"); // Should be plain span, not parsed
  });

  it("handles nowrap option", () => {
    render(
      <Provider>
        <div data-testid="container">
          <Mfm text="line1\nline2" nowrap />
        </div>
      </Provider>,
    );

    const container = screen.getByTestId("container");
    expect(container.innerHTML).not.toContain("<br>");
  });
});

describe("MfmSimple", () => {
  it("renders simple text formatting", () => {
    render(
      <Provider>
        <MfmSimple text="**bold** and *italic*" />
      </Provider>,
    );

    // MfmSimple should not process markdown-style formatting
    expect(screen.getByText("**bold** and *italic*")).toBeInTheDocument();
  });

  it("does not render complex MFM syntax", () => {
    render(
      <Provider>
        <MfmSimple text="$[spin text]" />
      </Provider>,
    );

    // Simple parser should not process $[spin] syntax
    expect(screen.getByText("$[spin text]")).toBeInTheDocument();
  });
});

describe("MfmConfig", () => {
  it("uses custom components when configured", () => {
    const CustomHashtag = ({ hashtag }: { hashtag: string }) => (
      <span data-testid="custom-hashtag">#{hashtag}</span>
    );

    const store = {
      // biome-ignore lint/style/useNamingConvention: Property name matches MFM component convention
      get: () => ({ Hashtag: CustomHashtag }),
      set: () => {},
      sub: () => () => {},
    };

    render(
      // biome-ignore lint/suspicious/noExplicitAny: Test mock store type
      <Provider store={store as any}>
        <Mfm text="#test" />
      </Provider>,
    );

    expect(screen.getByTestId("custom-hashtag")).toBeInTheDocument();
    expect(screen.getByTestId("custom-hashtag")).toHaveTextContent("#test");
  });
});
