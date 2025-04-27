import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "./label";

describe("Label", () => {
  it("should render the component with text", () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("should render the component with a htmlFor attribute", () => {
    render(<Label htmlFor="test-input">Label for Input</Label>);
    const labelElement = screen.getByText("Label for Input");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement).toHaveAttribute("for", "test-input");
  });
});
