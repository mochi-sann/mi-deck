import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("should render the component", () => {
    render(<Spinner />);
    // Add assertions here to check for the presence of the spinner element
    // This might involve checking for a specific role, test ID, or SVG element
  });

  it("should render with a specific size", () => {
    render(<Spinner size="default" />); // Changed size to a valid string literal
    // Add assertions here to check if the size prop is applied correctly
  });
});
