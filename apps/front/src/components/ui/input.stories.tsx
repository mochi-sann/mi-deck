import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Input } from "./input";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    type: {
      control: "select",
      options: ["text", "password", "email", "number", "search", "tel", "url"],
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    value: { control: "text" },
    // Use `fn` to spy on the onChange arg, which will appear in the actions panel once invoked
    onChange: { action: "changed" },
    "aria-invalid": { control: "boolean" }, // Control aria-invalid for styling
  },
  // Default args
  args: {
    onChange: fn(),
    placeholder: "Type something...",
    disabled: false,
    type: "text",
    "aria-invalid": false,
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {}, // Inherits default args
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Enter your email",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Cannot type here",
    disabled: true,
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password",
  },
};

export const NumberInput: Story = {
  args: {
    type: "number",
    placeholder: "Enter a number",
  },
};

export const Invalid: Story = {
  args: {
    placeholder: "Invalid input",
    "aria-invalid": true, // Set aria-invalid to true to show error state
    value: "Incorrect value",
  },
};

// Story with interaction test
export const WithInteractionTest: Story = {
  args: {
    placeholder: "Type here to test",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const inputElement = canvas.getByPlaceholderText("Type here to test");

    // Simulate user typing into the input
    const testValue = "Hello Storybook!";
    await userEvent.type(inputElement, testValue);

    // Assert that the onChange mock function was called for each character typed
    await expect(args.onChange).toHaveBeenCalledTimes(testValue.length);

    // Assert that the input's value is now the typed text
    // Note: Directly checking inputElement.value works here because it's a simple input
    await expect(inputElement).toHaveValue(testValue);
  },
};
