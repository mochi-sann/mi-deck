import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("should render the component", () => {
    render(<Textarea />);
    // Add assertions here
  });

  it("should display the correct value when typed into", () => {
    render(<Textarea />);
    const textareaElement = screen.getByRole("textbox");
    fireEvent.change(textareaElement, {
      target: { value: "test textarea input" },
    });
    expect(textareaElement).toHaveValue("test textarea input");
  });

  it("should be disabled when the disabled prop is true", () => {
    render(<Textarea disabled />);
    const textareaElement = screen.getByRole("textbox");
    expect(textareaElement).toBeDisabled();
  });

  it("should have the correct placeholder", () => {
    render(<Textarea placeholder="Enter text here" />);
    expect(screen.getByPlaceholderText("Enter text here")).toBeInTheDocument();
  });
});
