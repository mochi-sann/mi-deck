import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sheet, SheetTrigger } from "./sheet";

describe("Sheet", () => {
  it("should render the SheetTrigger", () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
      </Sheet>,
    );
    expect(screen.getByText("Open Sheet")).toBeInTheDocument();
  });

  // Note: Testing the full Sheet functionality (opening, closing, content rendering)
  // often requires more advanced testing setups due to portal rendering.
  // This basic test file focuses on rendering the trigger.
});
