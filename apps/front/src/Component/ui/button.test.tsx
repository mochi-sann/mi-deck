import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("should render the component with text", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("should render the component with a specific variant", () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    expect(screen.getByText("Secondary Button")).toBeInTheDocument();
    // You might add assertions here to check for specific classes based on the variant
  });

  it("should render the component with a specific size", () => {
    render(<Button size="sm">Small Button</Button>);
    expect(screen.getByText("Small Button")).toBeInTheDocument();
    // You might add assertions here to check for specific classes based on the size
  });

  it("should be disabled when the disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByText("Disabled Button")).toBeDisabled();
  });
});
