import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator";

const meta: Meta<typeof Separator> = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    decorative: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  args: {
    orientation: "horizontal",
  },
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: () => (
    <div className="flex h-20 items-center gap-4">
      <div>Left</div>
      <Separator orientation="vertical" />
      <div>Right</div>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Profile Settings</h4>
        <p className="text-muted-foreground text-sm">
          Update your profile information and preferences.
        </p>
      </div>
      <Separator />
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Notifications</h4>
        <p className="text-muted-foreground text-sm">
          Configure how you receive notifications.
        </p>
      </div>
    </div>
  ),
};

export const InNavigation: Story = {
  render: () => (
    <div className="flex h-20 items-center gap-4">
      <nav className="flex items-center gap-4">
        {/* biome-ignore lint/a11y/useValidAnchor: Demo link for Storybook showcase */}
        <a href="#" className="font-medium text-sm">
          Home
        </a>
        <Separator orientation="vertical" />
        {/* biome-ignore lint/a11y/useValidAnchor: Demo link for Storybook showcase */}
        <a href="#" className="font-medium text-sm">
          About
        </a>
        <Separator orientation="vertical" />
        {/* biome-ignore lint/a11y/useValidAnchor: Demo link for Storybook showcase */}
        <a href="#" className="font-medium text-sm">
          Services
        </a>
        <Separator orientation="vertical" />
        {/* biome-ignore lint/a11y/useValidAnchor: Demo link for Storybook showcase */}
        <a href="#" className="font-medium text-sm">
          Contact
        </a>
      </nav>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-[350px] rounded-lg border p-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-lg">Card Title</h3>
          <p className="text-muted-foreground text-sm">
            Card description goes here.
          </p>
        </div>
        <Separator />
        <div className="flex h-5 items-center space-x-4 text-sm">
          <div>View</div>
          <Separator orientation="vertical" />
          <div>Edit</div>
          <Separator orientation="vertical" />
          <div>Delete</div>
        </div>
      </div>
    </div>
  ),
};

export const InList: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Recent Activity</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">New user registration</span>
            <span className="text-muted-foreground text-sm">2m ago</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm">Profile update</span>
            <span className="text-muted-foreground text-sm">5m ago</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm">New comment</span>
            <span className="text-muted-foreground text-sm">10m ago</span>
          </div>
        </div>
      </div>
    </div>
  ),
};
