import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heart, Link2, Settings, Share2, Star, Trash2 } from "lucide-react";
import { IconButton } from "./icon-button";

const meta: Meta<typeof IconButton> = {
  title: "UI/IconButton",
  component: IconButton,
  tags: ["autodocs"],
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
      options: ["default", "sm", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: {
    children: <Heart className="size-4" />,
    "aria-label": "Like",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton variant="default" aria-label="Like">
        <Heart className="size-4" />
      </IconButton>
      <IconButton variant="destructive" aria-label="Delete">
        <Trash2 className="size-4" />
      </IconButton>
      <IconButton variant="outline" aria-label="Settings">
        <Settings className="size-4" />
      </IconButton>
      <IconButton variant="secondary" aria-label="Star">
        <Star className="size-4" />
      </IconButton>
      <IconButton variant="ghost" aria-label="Share">
        <Share2 className="size-4" />
      </IconButton>
      <IconButton variant="link" aria-label="Copy Link">
        <Link2 className="size-4" />
      </IconButton>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton size="sm" aria-label="Small button">
        <Heart className="size-3" />
      </IconButton>
      <IconButton size="default" aria-label="Default button">
        <Heart className="size-4" />
      </IconButton>
      <IconButton size="lg" aria-label="Large button">
        <Heart className="size-5" />
      </IconButton>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton disabled aria-label="Disabled button">
        <Heart className="size-4" />
      </IconButton>
      <IconButton
        disabled
        variant="destructive"
        aria-label="Disabled destructive button"
      >
        <Trash2 className="size-4" />
      </IconButton>
    </div>
  ),
};

export const WithTooltip: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton variant="ghost" aria-label="Settings" title="Settings">
        <Settings className="size-4" />
      </IconButton>
      <IconButton variant="ghost" aria-label="Share" title="Share">
        <Share2 className="size-4" />
      </IconButton>
    </div>
  ),
};
