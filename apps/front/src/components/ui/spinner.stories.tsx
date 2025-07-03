import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import { Spinner } from "./spinner";

const meta: Meta<typeof Spinner> = {
  title: "UI/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm", "sl", "lg", "xl"],
    },
    variant: {
      control: "select",
      options: ["default", "primary", "secondary", "muted"],
    },
    speed: {
      control: { type: "range", min: 100, max: 3000, step: 100 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    size: "default",
    variant: "default",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="sm" />
      <Spinner size="sl" />
      <Spinner size="default" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner variant="default" />
      <Spinner variant="primary" />
      <Spinner variant="secondary" />
      <Spinner variant="muted" />
    </div>
  ),
};

export const Speeds: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner speed={500} />
      <Spinner speed={1000} />
      <Spinner speed={2000} />
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Spinner size="sm" variant="muted" />
      <span className="text-muted-foreground text-sm">Loading...</span>
    </div>
  ),
};

export const Centered: Story = {
  render: () => (
    <div className="flex h-[200px] items-center justify-center">
      <Spinner size="lg" variant="primary" />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground"
        disabled
      >
        <Spinner size="sm" variant="default" />
        <span>Loading...</span>
      </Button>
      <Button
        className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-secondary-foreground"
        disabled
      >
        <Spinner size="sm" variant="secondary" />
        <span>Processing...</span>
      </Button>
    </div>
  ),
};

export const CustomColor: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="text-blue-500" />
      <Spinner className="text-green-500" />
      <Spinner className="text-red-500" />
      <Spinner className="text-yellow-500" />
    </div>
  ),
};
