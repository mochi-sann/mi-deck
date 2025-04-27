import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("should render the component", () => {
    render(<Input />);
    // Add assertions here
  });

  it("should display the correct value when typed into", () => {
    render(<Input />);
    const inputElement = screen.getByRole("textbox");
    fireEvent.change(inputElement, { target: { value: "test input" } });
    expect(inputElement).toHaveValue("test input");
  });

  it("should be disabled when the disabled prop is true", () => {
    render(<Input disabled />);
    const inputElement = screen.getByRole("textbox");
    expect(inputElement).toBeDisabled();
  });

  it("should have the correct placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });
});
