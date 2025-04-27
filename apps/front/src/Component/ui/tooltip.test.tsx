import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tooltip, TooltipProvider, TooltipTrigger } from "./tooltip";

describe("Tooltip", () => {
  it("should render the TooltipTrigger within TooltipProvider", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover Me</TooltipTrigger>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByText("Hover Me")).toBeInTheDocument();
  });

  // Note: Testing the full Tooltip functionality (showing/hiding content on hover)
  // often requires more advanced testing techniques due to asynchronous behavior
  // and potential portal rendering. This basic test file focuses on rendering the trigger.
});
