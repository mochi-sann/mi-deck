import katex from "katex";
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Code from "./Code";

describe("generated HTML safety", () => {
  it("escapes code before inserting Shiki output", async () => {
    const code = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
    const { container } = render(<Code code={code} />);

    await waitFor(() => {
      expect(
        container.querySelector(".mfm-blockCode pre code"),
      ).toBeInTheDocument();
    });

    expect(
      container.querySelector("script, img, [onerror]"),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector(".mfm-blockCode pre code"),
    ).toHaveTextContent(code);
  });

  it("does not allow executable KaTeX output", () => {
    const formula = String.raw`\href{javascript:alert(1)}{x}`;
    const template = document.createElement("template");
    template.innerHTML = katex.renderToString(formula, {
      throwOnError: false,
      trust: false,
    });

    expect(
      template.content.querySelector(
        'script, img, iframe, object, embed, a[href^="javascript:"], [onerror]',
      ),
    ).not.toBeInTheDocument();
  });
});
