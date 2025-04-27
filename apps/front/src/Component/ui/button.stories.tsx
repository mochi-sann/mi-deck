import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { PlusIcon } from "lucide-react"; // Example icon
import React from "react";
import { Button } from "./button";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    buttonWidth: {
      control: "radio",
      options: ["default", "full"],
    },
    isLoading: { control: "boolean" },
    disabled: { control: "boolean" },
    asChild: { control: "boolean" },
    onClick: { action: "clicked" }, // Use action logger for onClick
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    onClick: fn(),
    children: "Button Text",
    isLoading: false,
    disabled: false,
    asChild: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const Icon: Story = {
  args: {
    size: "icon",
    children: <PlusIcon />, // Render an icon instead of text
  },
};
export const IconAndText: Story = {
  args: {
    size: "icon",
    children: (
      <React.Fragment>
        <PlusIcon /> テキストテキスト
        <PlusIcon />
      </React.Fragment>
    ), // Render an icon instead of text
  },
};

export const FullWidth: Story = {
  args: {
    buttonWidth: "full",
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    children: "Loading...", // Optional: Change text during loading
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const AsChild: Story = {
  args: {
    asChild: true,

    // biome-ignore lint/a11y/useValidAnchor:
    children: <a href="#">Link Button</a>, // Render as an anchor tag
  },
};

// Story with interaction test
export const WithInteractionTest: Story = {
  args: {
    variant: "default",
    children: "Click Me",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /Click Me/i });

    // Simulate user clicking the button
    await userEvent.click(button);

    // Assert that the onClick mock function was called
    await expect(args.onClick).toHaveBeenCalled();
  },
};
