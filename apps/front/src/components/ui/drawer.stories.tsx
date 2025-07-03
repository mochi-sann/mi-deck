import type { Meta, StoryObj } from "@storybook/react-vite";
import { MinusIcon, PlusIcon } from "lucide-react";
import type * as React from "react";
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
