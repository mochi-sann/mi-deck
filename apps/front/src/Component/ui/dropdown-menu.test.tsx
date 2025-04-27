import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DropdownMenu, DropdownMenuTrigger } from "./dropdown-menu";

describe("DropdownMenu", () => {
  it("should render the DropdownMenuTrigger", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
      </DropdownMenu>,
    );
    expect(screen.getByText("Open Menu")).toBeInTheDocument();
  });

  // Note: Testing the full DropdownMenu functionality (opening, closing, content rendering)
  // often requires more advanced testing setups due to potential portal rendering and
  // interactions. This basic test file focuses on rendering the trigger.
});
