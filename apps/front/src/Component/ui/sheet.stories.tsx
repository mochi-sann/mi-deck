import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const meta: Meta<typeof Sheet> = {
  title: "UI/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              Name
            </label>
            <input
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-right">
              Username
            </label>
            <input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3"
            />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const LeftSide: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Left Sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Browse through different sections of the application.
          </SheetDescription>
        </SheetHeader>
        <nav className="grid gap-4 py-4">
          {/* biome-ignore lint/a11y/useValidAnchor: */}
          <a href="#" className="font-medium text-sm">
            Dashboard
          </a>
          {/* biome-ignore lint/a11y/useValidAnchor: */}
          <a href="#" className="font-medium text-sm">
            Settings
          </a>
          {/* biome-ignore lint/a11y/useValidAnchor: */}
          <a href="#" className="font-medium text-sm">
            Profile
          </a>
          {/* biome-ignore lint/a11y/useValidAnchor: */}
          <a href="#" className="font-medium text-sm">
            Help
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  ),
};

export const TopSide: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Top Sheet</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>View your recent notifications.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="size-2 rounded-full bg-blue-500" />
            <div className="flex-1">
              <p className="font-medium text-sm">New message received</p>
              <p className="text-muted-foreground text-sm">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-2 rounded-full bg-green-500" />
            <div className="flex-1">
              <p className="font-medium text-sm">Task completed</p>
              <p className="text-muted-foreground text-sm">5 minutes ago</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const BottomSide: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Bottom Sheet</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Share</SheetTitle>
          <SheetDescription>Share this content with others.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" className="w-full">
              Copy Link
            </Button>
            <Button variant="outline" className="w-full">
              Share on Twitter
            </Button>
            <Button variant="outline" className="w-full">
              Share on Facebook
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Form Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create New Project</SheetTitle>
          <SheetDescription>
            Fill in the details to create a new project.
          </SheetDescription>
        </SheetHeader>
        <form className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="project-name">Project Name</label>
            <input
              id="project-name"
              placeholder="Enter project name"
              className="w-full"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Enter project description"
              className="w-full"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="category">Category</label>
            <select id="category" className="w-full">
              <option value="">Select a category</option>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile Development</option>
              <option value="design">Design</option>
            </select>
          </div>
        </form>
        <SheetFooter>
          <Button type="submit">Create Project</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
