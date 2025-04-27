import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Popover, PopoverTrigger } from "./popover";

describe("Popover", () => {
  it("should render the PopoverTrigger", () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
      </Popover>,
    );
    expect(screen.getByText("Open Popover")).toBeInTheDocument();
  });

  // Note: Testing the full Popover functionality (opening, closing, content rendering)
  // often requires more advanced testing setups due to portal rendering and
  // interactions. This basic test file focuses on rendering the trigger.
});
