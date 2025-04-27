import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Text from "./text";

describe("Text", () => {
  it("should render the component with text", () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});
