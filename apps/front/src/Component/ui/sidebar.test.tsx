import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sidebar } from "./sidebar";

describe("Sidebar", () => {
  it("should render the component", () => {
    render(<Sidebar />);
    // Add assertions here
  });

  it("should render with children content", () => {
    render(
      <Sidebar>
        <div>Sidebar Content</div>
      </Sidebar>,
    );
    expect(screen.getByText("Sidebar Content")).toBeInTheDocument();
  });
});
