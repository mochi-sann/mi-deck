import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IconButton } from "./icon-button";

describe("IconButton", () => {
  it("should render the component", () => {
    render(<IconButton aria-label="Test Button" />);
    // Add assertions here
  });

  it("should render the component with a specific variant", () => {
    render(
      <IconButton variant="secondary" aria-label="Secondary Test Button" />,
    );
    // Add assertions here to check for specific classes based on the variant
  });

  it("should render the component with a specific size", () => {
    render(<IconButton size="sm" aria-label="Small Test Button" />);
    // Add assertions here to check for specific classes based on the size
  });

  it("should be disabled when the disabled prop is true", () => {
    render(<IconButton disabled aria-label="Disabled Test Button" />);
    expect(screen.getByLabelText("Disabled Test Button")).toBeDisabled();
  });
});
