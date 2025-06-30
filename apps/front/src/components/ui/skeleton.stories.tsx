import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "secondary"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    className: "h-4 w-[250px]",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton className="h-4 w-[250px]" variant="default" />
      <Skeleton className="h-4 w-[250px]" variant="primary" />
      <Skeleton className="h-4 w-[250px]" variant="secondary" />
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" variant="primary" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" variant="default" />
        <Skeleton className="h-4 w-[200px]" variant="secondary" />
      </div>
    </div>
  ),
};

export const Profile: Story = {
  render: () => (
    <div className="flex flex-col space-y-3">
      <Skeleton
        className="h-[125px] w-[125px] rounded-full"
        variant="primary"
      />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" variant="default" />
        <Skeleton className="h-4 w-[200px]" variant="secondary" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" variant="default" />
        <Skeleton className="h-4 w-[200px]" variant="secondary" />
        <Skeleton className="h-4 w-[150px]" variant="default" />
      </div>
    </div>
  ),
};

export const Article: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[300px]" variant="primary" />
      <Skeleton className="h-4 w-[250px]" variant="default" />
      <Skeleton className="h-4 w-[200px]" variant="secondary" />
      <Skeleton className="h-4 w-[250px]" variant="default" />
      <Skeleton className="h-4 w-[200px]" variant="secondary" />
      <Skeleton className="h-4 w-[150px]" variant="default" />
    </div>
  ),
};

export const Table: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-[100px]" variant="primary" />
        <Skeleton className="h-4 w-[100px]" variant="default" />
        <Skeleton className="h-4 w-[100px]" variant="secondary" />
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-[100px]" variant="default" />
        <Skeleton className="h-4 w-[100px]" variant="secondary" />
        <Skeleton className="h-4 w-[100px]" variant="default" />
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-[100px]" variant="secondary" />
        <Skeleton className="h-4 w-[100px]" variant="default" />
        <Skeleton className="h-4 w-[100px]" variant="secondary" />
      </div>
    </div>
  ),
};

export const Form: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" variant="primary" />
        <Skeleton className="h-10 w-[300px]" variant="default" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" variant="primary" />
        <Skeleton className="h-10 w-[300px]" variant="default" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" variant="primary" />
        <Skeleton className="h-20 w-[300px]" variant="default" />
      </div>
      <Skeleton className="h-10 w-[100px]" variant="secondary" />
    </div>
  ),
};
