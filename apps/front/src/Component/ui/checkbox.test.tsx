import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("should render the component", () => {
    render(<Checkbox />);
    // Add assertions here
  });

  it("should be checked when clicked", () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("should call the onCheckedChange handler when clicked", () => {
    const handleCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={handleCheckedChange} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(handleCheckedChange).toHaveBeenCalledTimes(1);
  });
});
