import { render, screen } from "@testing-library/react";
import { Provider } from "jotai";
import { describe, expect, it } from "vitest";
import Link from "./Link";

describe("Link", () => {
  it("renders basic URL link", () => {
    render(
      <Provider>
        <Link href="https://example.com">https://example.com</Link>
      </Provider>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveTextContent("https://example.com");
    expect(link).toHaveClass("mfm-link");
  });

  it("renders link with custom text", () => {
    render(
      <Provider>
        <Link href="https://example.com">Custom Text</Link>
      </Provider>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveTextContent("Custom Text");
  });

  it("opens external links in new tab", () => {
    render(
      <Provider>
        <Link href="https://external.com">https://external.com</Link>
      </Provider>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("handles relative URLs", () => {
    render(
      <Provider>
        <Link href="/internal">/internal</Link>
      </Provider>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/internal");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
