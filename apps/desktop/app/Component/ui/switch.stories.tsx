import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";
import { Switch } from "./switch";

const meta: Meta<typeof Switch> = {
  title: "UI/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
    },
    defaultChecked: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    defaultChecked: false,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Switch id="notifications" />
        <Label htmlFor="notifications">Notifications</Label>
      </div>
      <p className="text-muted-foreground text-sm">
        Receive notifications about new messages and updates.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch disabled />
      <Label>Disabled Switch</Label>
    </div>
  ),
};

export const DisabledChecked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch disabled defaultChecked />
      <Label>Disabled Checked Switch</Label>
    </div>
  ),
};

export const MultipleSwitches: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="wifi" />
        <Label htmlFor="wifi">Wi-Fi</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="bluetooth" />
        <Label htmlFor="bluetooth">Bluetooth</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="location" />
        <Label htmlFor="location">Location Services</Label>
      </div>
    </div>
  ),
};

export const WithForm: Story = {
  render: () => (
    <form className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch id="marketing" name="marketing" />
          <Label htmlFor="marketing">Marketing Emails</Label>
        </div>
        <p className="text-muted-foreground text-sm">
          Receive emails about new products, features, and more.
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch id="security" name="security" />
          <Label htmlFor="security">Security Updates</Label>
        </div>
        <p className="text-muted-foreground text-sm">
          Receive emails about your account security.
        </p>
      </div>
    </form>
  ),
};
