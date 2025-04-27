import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import TestComponet from "./TestComponet";

describe("TestComponet", () => {
  it("should render the component", () => {
    render(<TestComponet />);
    // Add assertions here based on the content of TestComponet
    // For example, if TestComponet renders a specific text:
    // expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
