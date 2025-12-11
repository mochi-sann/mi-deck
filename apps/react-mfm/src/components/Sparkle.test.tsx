import { render } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import Sparkle from "./Sparkle";

describe("Sparkle", () => {
  beforeAll(() => {
    vi.stubGlobal(
      "ResizeObserver",
      vi.fn(() => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
      })),
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("renders children correctly", () => {
    const { getByText } = render(
      <Sparkle>
        <span>Sparkle Content</span>
      </Sparkle>,
    );
    expect(getByText("Sparkle Content")).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    const { unmount } = render(
      <Sparkle>
        <span>Test</span>
      </Sparkle>,
    );
    expect(document.body).toBeInTheDocument();
    unmount();
  });
});
