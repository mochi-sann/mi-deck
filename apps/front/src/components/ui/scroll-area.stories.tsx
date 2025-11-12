import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScrollArea, ScrollBar } from "./scroll-area";

const ITEMS = Array.from({ length: 32 }, (_, index) => `ログ #${index + 1}`);
const mergeClassName = (base: string, extra?: string) =>
  extra ? `${base} ${extra}` : base;

const meta = {
  title: "UI/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["auto", "scroll", "hover", "always"],
    },
    scrollHideDelay: {
      control: { type: "number", min: 0, step: 100 },
    },
    viewportClassName: {
      control: "text",
    },
  },
  args: {
    type: "hover",
    scrollHideDelay: 600,
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const DemoContent = () => (
  <div className="space-y-2 p-4 text-sm">
    {ITEMS.map((item) => (
      <div
        key={item}
        className="rounded-md border border-border/60 bg-muted/40 px-2 py-1"
      >
        {item}
      </div>
    ))}
  </div>
);
const DemoContentHorizontal = () => (
  <div className="flex flex-row gap-4 space-y-2 p-4 text-sm">
    {ITEMS.map((item) => (
      <div
        key={item}
        className="h-60 w-20 rounded-md border border-border/60 bg-muted/40 px-4 py-1"
      >
        {item}
      </div>
    ))}
  </div>
);

export const Default: Story = {
  render: (args) => (
    <div className="h-72 w-64 overflow-hidden rounded-lg border border-border/60 border-dashed bg-background">
      <ScrollArea
        {...args}
        className={mergeClassName("h-full w-full", args.className)}
      >
        <DemoContent />
      </ScrollArea>
    </div>
  ),
};
export const Horizontal: Story = {
  render: (args) => (
    <div className="h-72 w-64 rounded-lg border border-border/60 border-dashed bg-background">
      <ScrollArea
        {...args}
        className={mergeClassName("h-full w-full", args.className)}
      >
        <DemoContentHorizontal />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  ),
};

export const WithStickyHeader: Story = {
  render: (args) => (
    <div className="h-64 w-80 overflow-hidden rounded-lg border bg-background shadow-sm">
      <ScrollArea
        {...args}
        className={mergeClassName("h-full w-full rounded-lg", args.className)}
      >
        <div className="sticky top-0 z-10 bg-background px-4 py-2 font-semibold text-sm">
          最近のログ
        </div>
        <DemoContent />
      </ScrollArea>
    </div>
  ),
};

export const DenseContent: Story = {
  args: {
    viewportClassName:
      "px-2 py-1 [&>div]:space-y-1 [&>div]:text-xs [&>div>div]:rounded-sm [&>div>div]:bg-background",
  },
  render: (args) => (
    <div className="h-48 w-96 overflow-hidden rounded-lg border bg-background">
      <ScrollArea
        {...args}
        className={mergeClassName("h-full w-full bg-muted/20", args.className)}
      >
        <DemoContent />
      </ScrollArea>
    </div>
  ),
};
