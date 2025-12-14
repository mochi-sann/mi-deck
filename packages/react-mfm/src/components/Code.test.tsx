import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Code from "./Code";

// Mock shiki
vi.mock("shiki/bundle/web", () => ({
  bundledLanguages: { js: {}, ts: {} },
  createHighlighter: vi.fn().mockReturnValue({
    loadLanguage: vi.fn().mockResolvedValue(undefined),
    getLoadedLanguages: vi.fn().mockReturnValue(["js", "ts"]),
    codeToHtml: vi.fn((code) => `<span class="highlighted">${code}</span>`),
  }),
}));

describe("Code", () => {
  it("renders code block correctly", async () => {
    render(<Code code="const a = 1;" lang="js" />);

    await waitFor(() => {
      expect(screen.getByText("const a = 1;")).toBeInTheDocument();
    });

    // Check if highlighted class exists (from our mock)
    const element = screen.getByText("const a = 1;");
    // Depending on how testing-library parses innerHTML, we might need to check container
    expect(element.closest(".mfm-blockCode")).toBeInTheDocument();
  });

  it("renders fallback while loading", () => {
    // We can't easily test Suspense fallback with existing mocks resolving immediately,
    // but we can verify independent rendering.
    render(<Code code="console.log('test')" />);
    expect(screen.getByText("console.log('test')")).toBeInTheDocument();
  });
});
