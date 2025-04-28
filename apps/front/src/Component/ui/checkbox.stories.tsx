import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { Checkbox } from "./checkbox";
import { Label } from "./label"; // Import Label for context

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "select",
      options: [true, false, "indeterminate"], // Radix supports indeterminate state
      description: "The controlled checked state of the checkbox.",
    },
    disabled: {
      control: "boolean",
      description: "Prevents user interaction with the checkbox.",
    },
    "aria-invalid": {
      control: "boolean",
      description: "Marks the checkbox as invalid for styling.",
    },
    // Use `fn` to spy on the onCheckedChange arg
    onCheckedChange: { action: "checkedChanged" },
  },
  args: {
    checked: false,
    disabled: false,
    "aria-invalid": false,
    onCheckedChange: fn(),
  },
  // Decorator to add a label for better context and interaction testing
  decorators: [
    (Story) => (
      <div className="flex items-center space-x-2">
        <Story />
        <Label htmlFor="storybook-checkbox">Accept terms</Label>
      </div>
    ),
  ],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    id: "storybook-checkbox", // ID for label association
  },
};

export const Checked: Story = {
  args: {
    id: "storybook-checkbox",
    checked: true,
  },
};

// Radix Checkbox supports an indeterminate state
export const Indeterminate: Story = {
  args: {
    id: "storybook-checkbox",
    checked: "indeterminate",
  },
};

export const DisabledUnchecked: Story = {
  args: {
    id: "storybook-checkbox",
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    id: "storybook-checkbox",
    checked: true,
    disabled: true,
  },
};

export const Invalid: Story = {
  args: {
    id: "storybook-checkbox",
    "aria-invalid": true,
  },
};

// Story with interaction test using useState
export const WithInteractionTest: Story = {
  args: {
    id: "storybook-checkbox-interactive", // Ensure ID is set for the label click
    // We still pass the mocked fn to args to allow Storybook's action logger to pick it up
    onCheckedChange: fn(),
  },
  // Use the render function to introduce useState
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isChecked, setIsChecked] = React.useState(false);

    const handleCheckedChange = (checked: boolean | "indeterminate") => {
      // Ensure we only handle boolean changes for this state example
      if (typeof checked === "boolean") {
        setIsChecked(checked);
        // Call the mocked function passed in args as well
        args.onCheckedChange?.(checked);
      }
    };

    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          {...args} // Pass other args like id, disabled, etc.
          checked={isChecked}
          onCheckedChange={handleCheckedChange}
          id={args.id} // Ensure id is passed correctly
        />
        <Label htmlFor={args.id}>Accept terms!!!!!!!!!!!!!!!!!</Label>
      </div>
    );
  },
  // Disable global decorators for this specific story
  decorators: [],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");
    // The label text is now defined within the render function
    const label = canvas.getByText("Accept terms!!!!!!!!!!!!!!!!!");
    const label = canvas.getByText("Accept terms");

    // Initial state assertion
    expect(checkbox).not.toBeChecked();

    // Simulate user clicking the label to toggle the checkbox ON
    await userEvent.click(label);

    // Assert that the checkbox is now checked
    expect(checkbox).toBeChecked();
    // Assert that the onCheckedChange mock function was called with true
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);

    // Simulate user clicking the label again to toggle the checkbox OFF
    await userEvent.click(label);

    // Assert that the checkbox is now unchecked
    expect(checkbox).not.toBeChecked();
    // Assert that the onCheckedChange mock function was called again with false
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false);
  },
};
