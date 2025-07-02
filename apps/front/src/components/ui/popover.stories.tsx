import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, HelpCircle, Info, Settings } from "lucide-react";
import { Button } from "./button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

const meta: Meta<typeof Popover> = {
  title: "UI/Popover",
  component: Popover,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Dimensions</h4>
          <p className="text-muted-foreground text-sm">
            Set the dimensions for the layer.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Settings</h4>
          <p className="text-muted-foreground text-sm">
            Configure your preferences here.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Edit Profile</h4>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="font-medium text-sm">
                Name
              </label>
              <input
                id="name"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter your name"
              />
            </div>
            <Button>Save changes</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithList: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Bell className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Notifications</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-md p-2 hover:bg-accent">
              <Info className="size-4" />
              <div className="flex-1">
                <p className="font-medium text-sm">New message</p>
                <p className="text-muted-foreground text-xs">
                  You have a new message from John
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md p-2 hover:bg-accent">
              <HelpCircle className="size-4" />
              <div className="flex-1">
                <p className="font-medium text-sm">System update</p>
                <p className="text-muted-foreground text-xs">
                  System maintenance scheduled
                </p>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithAnchor: Story = {
  render: () => (
    <div className="relative h-[200px] w-full rounded-lg border p-4">
      <Popover>
        <PopoverAnchor className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2">
          <PopoverTrigger asChild>
            <Button variant="outline">Centered Popover</Button>
          </PopoverTrigger>
        </PopoverAnchor>
        <PopoverContent>
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Centered Content</h4>
            <p className="text-muted-foreground text-sm">
              This popover is centered using an anchor.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const DifferentAlignments: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Start</Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Start Aligned</h4>
            <p className="text-muted-foreground text-sm">
              This popover is aligned to the start.
            </p>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Center</Button>
        </PopoverTrigger>
        <PopoverContent align="center">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Center Aligned</h4>
            <p className="text-muted-foreground text-sm">
              This popover is aligned to the center.
            </p>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">End</Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">End Aligned</h4>
            <p className="text-muted-foreground text-sm">
              This popover is aligned to the end.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
