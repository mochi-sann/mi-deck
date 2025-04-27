import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { Separator } from "./separator";

describe("Separator", () => {
  it("should render the component", () => {
    render(<Separator />);
    // Add assertions here to check for the presence of the separator element
    // This might involve checking for a specific role or data attribute
  });

  it("should render with a specific orientation", () => {
    render(<Separator orientation="vertical" />);
    // Add assertions here to check if the orientation prop is applied correctly
  });
});
