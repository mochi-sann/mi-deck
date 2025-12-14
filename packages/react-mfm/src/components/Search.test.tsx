import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Search from "./Search";

describe("Search", () => {
  it("renders input with default query", () => {
    render(<Search query="initial query" content={""} />);
    const input = screen.getByDisplayValue("initial query");
    expect(input).toBeInTheDocument();
  });

  it("opens google search on button click", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<Search query="test" content={""} />);

    const button = screen.getByText("検索");
    fireEvent.click(button);

    expect(openSpy).toHaveBeenCalledWith(
      "https://www.google.com/search?q=test",
    );
    openSpy.mockRestore();
  });

  it("uses current input value for search", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<Search query="initial" content={""} />);

    const input = screen.getByDisplayValue("initial");
    fireEvent.change(input, { target: { value: "updated" } });

    const button = screen.getByText("検索");
    fireEvent.click(button);

    expect(openSpy).toHaveBeenCalledWith(
      "https://www.google.com/search?q=updated",
    );
    openSpy.mockRestore();
  });
});
