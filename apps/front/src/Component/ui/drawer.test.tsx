import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Drawer, DrawerTrigger } from "./drawer";

describe("Drawer", () => {
  it("should render the DrawerTrigger", () => {
    render(
      <Drawer>
        <DrawerTrigger>Open Drawer</DrawerTrigger>
      </Drawer>,
    );
    expect(screen.getByText("Open Drawer")).toBeInTheDocument();
  });

  // Note: Testing the full Drawer functionality (opening, closing, content rendering)
  // often requires more advanced testing setups due to portal rendering.
  // This basic test file focuses on rendering the trigger.
});
