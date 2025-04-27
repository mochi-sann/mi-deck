import type { Meta, StoryObj } from "@storybook/react";
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

// Story with interaction test
export const WithInteractionTest: Story = {
  args: {
    id: "storybook-checkbox", // Ensure ID is set for the label click
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Get by role is robust, but clicking the label is often more realistic
    // const checkbox = canvas.getByRole('checkbox');
    const label = canvas.getByText("Accept terms");

    // Simulate user clicking the label to toggle the checkbox
    await userEvent.click(label);

    // Assert that the onCheckedChange mock function was called with true
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);

    // Check visual state (presence of checkmark or data-state attribute)
    // Getting the checkbox again after interaction might be needed
    const checkboxAfterClick = canvas.getByRole("checkbox");
    await expect(checkboxAfterClick).toBeChecked(); // Works for boolean checked state
    // Or check data-state for more complex scenarios:
    // await expect(checkboxAfterClick).toHaveAttribute('data-state', 'checked');

    // Click again to uncheck
    await userEvent.click(label);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false);
    const checkboxAfterSecondClick = canvas.getByRole("checkbox");
    await expect(checkboxAfterSecondClick).not.toBeChecked();
    // await expect(checkboxAfterSecondClick).toHaveAttribute('data-state', 'unchecked');
  },
};
