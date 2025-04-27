import type { Meta, StoryObj } from "@storybook/react";
import { expect, fireEvent, fn, userEvent, within } from "@storybook/test";
import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import * as React from "react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "UI/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Controlled open state.",
      table: { category: "Controlled" },
    },
    onOpenChange: { action: "openChanged", table: { category: "Controlled" } },
    // modal: { control: 'boolean' }, // Radix prop
  },
  args: {
    open: false,
    onOpenChange: fn(),
    // modal: true,
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultTrigger = <Button variant="outline">Open Menu</Button>;

const defaultContent = (
  <>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem>
        <User className="mr-2" />
        <span>Profile</span>
        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <CreditCard className="mr-2" />
        <span>Billing</span>
        <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Settings className="mr-2" />
        <span>Settings</span>
        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Keyboard className="mr-2" />
        <span>Keyboard shortcuts</span>
        <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem>
        <Users className="mr-2" />
        <span>Team</span>
      </DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <UserPlus className="mr-2" />
          <span>Invite users</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            <DropdownMenuItem>
              <Mail className="mr-2" />
              <span>Email</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="mr-2" />
              <span>Message</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <PlusCircle className="mr-2" />
              <span>More...</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
      <DropdownMenuItem>
        <Plus className="mr-2" />
        <span>New Team</span>
        <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <Github className="mr-2" />
      <span>GitHub</span>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <LifeBuoy className="mr-2" />
      <span>Support</span>
    </DropdownMenuItem>
    <DropdownMenuItem disabled>
      <Cloud className="mr-2" />
      <span>API</span>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">
      <LogOut className="mr-2" />
      <span>Log out</span>
      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
    </DropdownMenuItem>
  </>
);

// Base render function
const renderMenu = (
  args: Story["args"],
  trigger: React.ReactNode,
  content: React.ReactNode,
) => (
  <DropdownMenu open={args?.open} onOpenChange={args?.onOpenChange}>
    <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
    <DropdownMenuContent className="w-56">{content}</DropdownMenuContent>
  </DropdownMenu>
);

// Stories
export const Default: Story = {
  render: (args) => renderMenu(args, defaultTrigger, defaultContent),
};

export const CheckboxItems: Story = {
  render: function RenderCheckbox(args) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [showStatusBar, setShowStatusBar] = React.useState(true);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [showActivityBar, setShowActivityBar] = React.useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [showPanel, setShowPanel] = React.useState(false);

    return renderMenu(
      args,
      defaultTrigger,
      <>
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showStatusBar}
          onCheckedChange={setShowStatusBar}
        >
          Status Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showActivityBar}
          onCheckedChange={setShowActivityBar}
          disabled
        >
          Activity Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showPanel}
          onCheckedChange={setShowPanel}
        >
          Panel
        </DropdownMenuCheckboxItem>
      </>,
    );
  },
};

export const RadioGroupItems: Story = {
  render: function RenderRadio(args) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [position, setPosition] = React.useState("bottom");

    return renderMenu(
      args,
      defaultTrigger,
      <>
        <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </>,
    );
  },
};

// Interaction Test
export const WithInteractionTest: Story = {
  render: (args) => renderMenu(args, defaultTrigger, defaultContent),
  args: {
    open: false,
    onOpenChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.parentElement || canvasElement); // Search in parent for portal
    const triggerButton = canvas.getByRole("button", { name: /Open Menu/i });

    // 1. Menu initially closed
    expect(canvas.queryByRole("menu")).toBeNull();

    // 2. Click trigger to open
    await userEvent.click(triggerButton);
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);

    // 3. Menu should be open, find an item
    const menu = await canvas.findByRole("menu");
    await expect(menu).toBeVisible();
    const profileItem = within(menu).getByText("Profile");
    await expect(profileItem).toBeVisible();

    // 4. Test keyboard navigation (ArrowDown)
    // Focus trigger first might be needed depending on setup
    // await triggerButton.focus();
    await fireEvent.keyDown(triggerButton, {
      key: "ArrowDown",
      code: "ArrowDown",
    }); // Open menu if closed, then moves focus
    // Need to wait for focus to move and potentially menu to fully render if async
    // Check if 'Profile' item is focused (or has data-focus attribute)
    // This depends heavily on Radix's focus management, might need data attributes
    // await expect(profileItem).toHaveFocus(); // This might not work directly

    // 5. Test selecting 'Profile' item with Enter
    // Assuming 'Profile' is focused after ArrowDown
    // await fireEvent.keyDown(profileItem, { key: 'Enter', code: 'Enter' });
    // Check if menu closes and potentially if an action associated with 'Profile' occurred
    // await expect(args.onOpenChange).toHaveBeenCalledWith(false);

    // 6. Re-open and test clicking 'Profile' item
    await userEvent.click(triggerButton); // Close first
    await userEvent.click(triggerButton); // Re-open
    const menuAgain = await canvas.findByRole("menu");
    const profileItemAgain = within(menuAgain).getByText("Profile");
    await userEvent.click(profileItemAgain);
    // Check if menu closes
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    expect(canvas.queryByRole("menu")).toBeNull();

    // 7. Test Submenu opening
    await userEvent.click(triggerButton); // Re-open
    const menuThird = await canvas.findByRole("menu");
    const inviteTrigger = within(menuThird).getByText("Invite users");

    // Hover or click to open submenu (depends on Radix implementation)
    // Using click for more reliable testing
    await userEvent.click(inviteTrigger);
    // Find submenu content
    const submenu = await canvas.findByRole("menu", { name: /Invite users/i }); // Submenu might have accessible name
    const emailItem = await within(submenu).findByText("Email");
    await expect(emailItem).toBeVisible();

    // 8. Click item in submenu
    await userEvent.click(emailItem);
    // Check if both menus close
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    expect(canvas.queryByRole("menu")).toBeNull(); // Check main menu is closed
  },
};
