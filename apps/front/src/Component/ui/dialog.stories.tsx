import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import * as React from "react";
import { Button } from "./button"; // For trigger and footer actions
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  // DialogOverlay, // Usually handled internally by DialogContent
  // DialogPortal, // Usually handled internally by DialogContent
} from "./dialog";
import { Input } from "./input"; // Example content
import { Label } from "./label"; // Example content

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "UI/Dialog",
  component: Dialog, // Root component
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Controlled open state.",
      table: { category: "Controlled" },
    },
    // defaultOpen is less useful for testing interactions, prefer controlled 'open'
    // defaultOpen: { control: 'boolean', description: 'Default open state (uncontrolled).' },
    onOpenChange: { action: "openChanged", table: { category: "Controlled" } },
    // modal: { control: 'boolean', description: 'Modality of the dialog.' }, // Radix prop
  },
  args: {
    // Default to controlled for easier testing via args/play function
    open: false,
    onOpenChange: fn(),
    // modal: true, // Default Radix behavior
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base render function for common structure
const renderDialog = (
  args: Story["args"],
  triggerContent: React.ReactNode,
  dialogContent: React.ReactNode,
) => (
  // Use optional chaining and provide defaults in case args is undefined
  <Dialog
    open={args?.open ?? false}
    onOpenChange={args?.onOpenChange ?? (() => {})}
  >
    <DialogTrigger asChild>{triggerContent}</DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">{dialogContent}</DialogContent>
  </Dialog>
);

const defaultTrigger = <Button variant="outline">Open Dialog</Button>;

const defaultDialogContent = (
  <>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        This is the description of the dialog. Make changes here. Click save
        when you're done.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Username
        </Label>
        <Input id="username" defaultValue="@peduarte" className="col-span-3" />
      </div>
    </div>
    <DialogFooter>
      <DialogClose asChild>
        <Button type="button" variant="secondary">
          Close
        </Button>
      </DialogClose>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </>
);

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  render: (args) => renderDialog(args, defaultTrigger, defaultDialogContent),
  args: {
    // Start closed by default based on meta args
  },
};

// Story with interaction test
export const WithInteractionTest: Story = {
  render: (args) => renderDialog(args, defaultTrigger, defaultDialogContent),
  args: {
    // Ensure controlled state for testing
    open: false,
    onOpenChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.parentElement || canvasElement); // Search in parent for dialog portal
    const triggerButton = canvas.getByRole("button", { name: /Open Dialog/i });

    // 1. Dialog initially closed
    // Use queryByRole as dialog content is not initially in the DOM (due to Portal)
    expect(canvas.queryByRole("dialog")).toBeNull();

    // 2. Click trigger to open
    await userEvent.click(triggerButton);
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);

    // 3. Dialog should be open and content visible
    // Use findByRole which waits for the element to appear
    const dialogContent = await canvas.findByRole("dialog");
    await expect(dialogContent).toBeVisible();
    const title = within(dialogContent).getByText("Dialog Title");
    await expect(title).toBeVisible();
    const nameInput = within(dialogContent).getByLabelText("Name");
    await expect(nameInput).toBeVisible();

    // 4. Click the default 'X' close button (part of DialogContent)
    const defaultCloseButton = within(dialogContent).getByRole("button", {
      name: /Close/i,
    }); // Radix adds sr-only "Close"
    await userEvent.click(defaultCloseButton);
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);

    // 5. Dialog should be closed
    // Use queryByRole again, potentially wait for animation if needed
    // await waitForElementToBeRemoved(() => canvas.queryByRole('dialog')); // More robust waiting
    expect(canvas.queryByRole("dialog")).toBeNull();

    // 6. Re-open dialog
    await userEvent.click(triggerButton);
    await expect(args.onOpenChange).toHaveBeenCalledWith(true); // Called again
    const dialogContentAgain = await canvas.findByRole("dialog");
    await expect(dialogContentAgain).toBeVisible();

    // 7. Click the custom 'Close' button in the footer (using DialogClose)
    const customCloseButton = within(dialogContentAgain).getByRole("button", {
      name: /Close/i,
    }); // Find the footer close button
    await userEvent.click(customCloseButton);
    await expect(args.onOpenChange).toHaveBeenCalledWith(false); // Called again

    // 8. Dialog should be closed
    expect(canvas.queryByRole("dialog")).toBeNull();
  },
};
