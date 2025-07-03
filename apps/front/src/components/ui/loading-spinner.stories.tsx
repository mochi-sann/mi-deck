import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingSpinner } from "./loading-spinner";

const meta: Meta<typeof LoadingSpinner> = {
  title: "UI/LoadingSpinner",
  component: LoadingSpinner,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    text: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
  args: {
    size: "md",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-8">
      <LoadingSpinner size="sm" />
      <LoadingSpinner size="md" />
      <LoadingSpinner size="lg" />
    </div>
  ),
};

export const WithText: Story = {
  args: {
    size: "md",
    text: "Loading...",
  },
};

export const DifferentTexts: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-8">
      <LoadingSpinner size="sm" text="Loading data..." />
      <LoadingSpinner size="md" text="Please wait..." />
      <LoadingSpinner size="lg" text="Processing your request..." />
    </div>
  ),
};

export const InContainer: Story = {
  render: () => (
    <div className="mx-auto w-full max-w-md rounded-lg border p-8">
      <LoadingSpinner size="md" text="Loading content..." />
    </div>
  ),
};

export const CustomClassName: Story = {
  render: () => (
    <div className="rounded-lg bg-muted p-8">
      <LoadingSpinner size="md" text="Loading..." className="text-primary" />
    </div>
  ),
};
