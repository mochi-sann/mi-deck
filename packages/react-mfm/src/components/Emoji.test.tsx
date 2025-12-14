import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Emoji from "./Emoji";

describe("Emoji", () => {
  it("renders emoji using Twemoji", () => {
    render(<Emoji emoji="😀" />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "😀");
    expect(img).toHaveClass("mfm-emoji");
    expect(img.getAttribute("src")).toContain("twemoji");
  });

  it("handles complex emoji", () => {
    render(<Emoji emoji="👨‍👩‍👧‍👦" />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "👨‍👩‍👧‍👦");
  });

  it("applies correct CSS class", () => {
    render(<Emoji emoji="🎉" />);

    const img = screen.getByRole("img");
    expect(img).toHaveClass("mfm-emoji");
  });
});
