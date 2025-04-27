import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dialog, DialogTrigger } from "./dialog";

describe("Dialog", () => {
  it("should render the DialogTrigger", () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
      </Dialog>,
    );
    expect(screen.getByText("Open Dialog")).toBeInTheDocument();
  });

  // Note: Testing the full Dialog functionality (opening, closing, content rendering)
  // often requires more advanced testing setups due to portal rendering.
  // This basic test file focuses on rendering the trigger.
});
