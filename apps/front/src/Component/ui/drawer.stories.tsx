import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { MinusIcon, PlusIcon } from "lucide-react";
import * as React from "react";
import { Button } from "./button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  // DrawerOverlay, // Usually handled internally
  // DrawerPortal, // Usually handled internally
} from "./drawer";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "UI/Drawer",
  component: Drawer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    direction: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
      description: "Direction the drawer opens from.",
    },
    open: {
      control: "boolean",
      description: "Controlled open state.",
      table: { category: "Controlled" },
    },
    onOpenChange: { action: "openChanged", table: { category: "Controlled" } },
    // Add other relevant DrawerPrimitive.Root props if needed
  },
  args: {
    // Default to uncontrolled for basic stories
    direction: "bottom",
    // Use controlled args for specific controlled stories or tests
    // open: false,
    // onOpenChange: fn(),
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base render function
const renderDrawer = (
  args: Story["args"],
  triggerContent: React.ReactNode,
  drawerContent: React.ReactNode,
) => (
  <Drawer {...args}>
    <DrawerTrigger asChild>{triggerContent}</DrawerTrigger>
    <DrawerContent>{drawerContent}</DrawerContent>
  </Drawer>
);

const defaultTrigger = <Button variant="outline">Open Drawer</Button>;

const defaultDrawerContent = (
  <div className="mx-auto w-full max-w-sm">
    <DrawerHeader>
      <DrawerTitle>Move Goal</DrawerTitle>
      <DrawerDescription>Set your daily activity goal.</DrawerDescription>
    </DrawerHeader>
    <div className="p-4 pb-0">
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full"
          // onClick={() => onClick(-10)} // State needed for this
          // disabled={goal <= 200}
        >
          <MinusIcon className="h-4 w-4" />
          <span className="sr-only">Decrease</span>
        </Button>
        <div className="flex-1 text-center">
          <div className="font-bold text-7xl tracking-tighter">
            {/* {goal} */} 300
          </div>
          <div className="text-[0.70rem] text-muted-foreground uppercase">
            Calories/day
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full"
          // onClick={() => onClick(10)}
          // disabled={goal >= 400}
        >
          <PlusIcon className="h-4 w-4" />
          <span className="sr-only">Increase</span>
        </Button>
      </div>
    </div>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose asChild>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </div>
);

// Stories for different directions
export const Bottom: Story = {
  render: (args) => renderDrawer(args, defaultTrigger, defaultDrawerContent),
  args: { direction: "bottom" },
};

export const Left: Story = {
  render: (args) => renderDrawer(args, defaultTrigger, defaultDrawerContent),
  args: { direction: "left" },
};

export const Right: Story = {
  render: (args) => renderDrawer(args, defaultTrigger, defaultDrawerContent),
  args: { direction: "right" },
};

export const Top: Story = {
  render: (args) => renderDrawer(args, defaultTrigger, defaultDrawerContent),
  args: { direction: "top" },
};

// Story with interaction test
export const WithInteractionTest: Story = {
  render: (args) => renderDrawer(args, defaultTrigger, defaultDrawerContent),
  args: {
    // Use controlled state for reliable testing of open/close
    open: false,
    onOpenChange: fn(),
    direction: "bottom", // Explicit direction for test
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.parentElement || canvasElement); // Search in parent for portal
    const triggerButton = canvas.getByRole("button", { name: /Open Drawer/i });

    // 1. Drawer initially closed
    // Drawer content might be in the DOM but hidden, depending on vaul's implementation
    // Check for a specific element inside the drawer content
    expect(canvas.queryByText("Move Goal")).toBeNull();

    // 2. Click trigger to open
    await userEvent.click(triggerButton);
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);

    // 3. Drawer should be open and content visible
    // Use findBy queries to wait for appearance
    const drawerTitle = await canvas.findByText("Move Goal");
    await expect(drawerTitle).toBeVisible();
    const submitButton = within(canvas.getByRole("dialog")).getByRole(
      "button",
      { name: /Submit/i },
    ); // vaul uses dialog role internally
    await expect(submitButton).toBeVisible();

    // 4. Click the 'Cancel' button (DrawerClose)
    const cancelButton = within(canvas.getByRole("dialog")).getByRole(
      "button",
      { name: /Cancel/i },
    );
    await userEvent.click(cancelButton);
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);

    // 5. Drawer should be closed
    // Wait for disappearance or check that content is gone
    // await waitForElementToBeRemoved(() => canvas.queryByText('Move Goal'));
    expect(canvas.queryByText("Move Goal")).toBeNull(); // Check if title is gone

    // Optional: Test closing by clicking overlay (if not disabled)
    // Need to find the overlay element first
    // const overlay = canvas.getByTestId('drawer-overlay'); // Assuming data-testid or similar
    // await userEvent.click(overlay);
    // await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
