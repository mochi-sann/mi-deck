import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Formula from "./Formula";

// Mock katex
vi.mock("katex", () => ({
  default: {
    renderToString: vi.fn((tex) => `<span class="katex-mock">${tex}</span>`),
  },
}));

describe("Formula", () => {
  it("renders inline formula correctly", async () => {
    render(<Formula formula="E = mc^2" />);

    await waitFor(() => {
      expect(screen.getByText("E = mc^2")).toBeInTheDocument();
    });

    const element = screen.getByText("E = mc^2");
    expect(element.tagName).toBe("SPAN");
  });

  it("renders block formula correctly", async () => {
    render(<Formula formula="\\sum_{i=0}^n i^2" block />);

    await waitFor(() => {
      // Check that the mocked katex output is present (it has a special class in our mock)
      // We use document.querySelector because the content is in dangerouslySetInnerHTML
      const element = document.querySelector(".katex-mock");
      expect(element).toBeInTheDocument();
      expect(element).toHaveTextContent("\\sum_{i=0}^n i^2");
    });

    const element = document.querySelector(".katex-mock");
    expect(element).toBeInTheDocument();
    // The container div for block has the html
    expect(element?.parentElement?.tagName).toBe("DIV");
  });
});
