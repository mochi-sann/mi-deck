import type { Meta, StoryObj } from "@storybook/react";
import { InfoIcon } from "lucide-react"; // Example icon
import { Badge } from "./badge";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
    asChild: { control: "boolean" },
    children: { control: "text" }, // Allow editing text content
  },
  args: {
    children: "Badge Text",
    variant: "default",
    asChild: false,
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
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

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <InfoIcon /> {/* Example using lucide-react icon */}
        Information
      </>
    ),
  },
};

export const AsChildLink: Story = {
  args: {
    asChild: true,
    // biome-ignore lint/a11y/useValidAnchor:
    children: <a href="#">Link Badge</a>, // Render as an anchor tag
    variant: "outline", // Example variant for link
  },
};

// Interaction tests are less common for static badges, but could be added
// if the badge had interactive elements (e.g., a close button).
