import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("should render the component", () => {
    render(<Skeleton />);
    // Add assertions here to check for the presence of the skeleton element
    // This might involve checking for a specific role or class
  });

  it("should render with specific dimensions", () => {
    render(<Skeleton className="h-4 w-32" />);
    // Add assertions here to check if the class names are applied correctly
  });
});
