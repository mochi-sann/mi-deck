import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { LoadingSpinner } from "./loading-spinner";

describe("LoadingSpinner", () => {
  it("should render the component", () => {
    render(<LoadingSpinner />);
    // Add assertions here to check for the presence of the spinner element
    // This might involve checking for a specific role, test ID, or SVG element
  });

  it("should render with a specific size", () => {
    render(<LoadingSpinner size="md" />); // Changed size to a valid string literal
    // Add assertions here to check if the size prop is applied correctly
  });

  it("should render with a specific color", () => {
    render(<LoadingSpinner color="blue" />);
    // Add assertions here to check if the color prop is applied correctly
  });
});
