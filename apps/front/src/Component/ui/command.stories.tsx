import type { Meta, StoryObj } from "@storybook/react";
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitForElementToBeRemoved,
  within,
} from "@storybook/test";
import {
  Calculator,
  CalendarIcon,
  CreditCard,
  SettingsIcon,
  SmileIcon,
  User,
} from "lucide-react";
import * as React from "react";
import { Button } from "./button"; // For CommandDialog trigger
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "UI/Command",
  component: Command, // Base component
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  // argTypes for Command itself (less common to control directly)
  // argTypes: { ... }
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

const commandContent = (
  <>
    <CommandInput placeholder="Type a command or search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Suggestions">
        <CommandItem onSelect={fn(() => console.log("Selected Calendar"))}>
          <CalendarIcon />
          <span>Calendar</span>
        </CommandItem>
        <CommandItem onSelect={fn(() => console.log("Selected Emoji"))}>
          <SmileIcon />
          <span>Search Emoji</span>
        </CommandItem>
        <CommandItem onSelect={fn(() => console.log("Selected Calculator"))}>
          <Calculator />
          <span>Calculator</span>
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Settings">
        <CommandItem onSelect={fn(() => console.log("Selected Profile"))}>
          <User />
          <span>Profile</span>
          <CommandShortcut>⌘P</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={fn(() => console.log("Selected Billing"))}>
          <CreditCard />
          <span>Billing</span>
          <CommandShortcut>⌘B</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={fn(() => console.log("Selected Settings"))}>
          <SettingsIcon />
          <span>Settings</span>
          <CommandShortcut>⌘S</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </>
);

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  render: (args) => (
    <Command {...args} className="w-[450px] rounded-lg border shadow-md">
      {commandContent}
    </Command>
  ),
};

// Story for CommandDialog
export const Dialog: StoryObj<typeof CommandDialog> = {
  // Point to CommandDialog for argTypes and controls if needed
  // component: CommandDialog, // Optional: If you want controls specific to Dialog
  args: {
    open: false, // Start closed
    onOpenChange: fn(),
  },
  render: function RenderDialog(args) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = React.useState(args.open);

    React.useEffect(() => {
      setOpen(args.open);
    }, [args.open]);

    const handleOpenChange = (openState: boolean) => {
      setOpen(openState);
      args.onOpenChange?.(openState);
    };

    return (
      <>
        <p className="text-muted-foreground text-sm">
          Press{" "}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>J
          </kbd>{" "}
          or click the button
        </p>
        <br />
        <Button onClick={() => handleOpenChange(true)}>Open Command</Button>
        <CommandDialog open={open} onOpenChange={handleOpenChange}>
          {commandContent}
        </CommandDialog>
      </>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.parentElement || canvasElement); // Search in parent for dialog
    const openButton = canvas.getByRole("button", { name: /Open Command/i });

    // Dialog initially closed
    // Use queryByRole for elements that might not exist
    expect(canvas.queryByRole("dialog")).toBeNull();

    // Click button to open dialog
    await userEvent.click(openButton);
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);

    // Dialog should be open now
    const dialog = await canvas.findByRole("dialog");
    await expect(dialog).toBeVisible();

    // Test typing and filtering within the dialog
    const input = within(dialog).getByPlaceholderText(
      /Type a command or search.../i,
    );
    await userEvent.type(input, "Calc");

    // Check if only Calculator item is visible (or expected filtered items)
    const calendarItem = within(dialog).queryByText("Calendar");
    const calcItem = within(dialog).getByText("Calculator");
    expect(calendarItem).toBeNull(); // Or .not.toBeVisible() depending on cmdk behavior
    expect(calcItem).toBeVisible();

    // Test selecting an item (e.g., pressing Enter)
    // Need to ensure the item is highlighted first if necessary
    // fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    // await expect(console.log).toHaveBeenCalledWith('Selected Calculator'); // Requires spying on console.log or the onSelect fn

    // Test closing (e.g., pressing Escape)
    await fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    // Use queryByRole again as the dialog should disappear
    // Add a small delay or wait for disappearance if needed due to animations
    await waitForElementToBeRemoved(() => canvas.queryByRole("dialog"));
    expect(canvas.queryByRole("dialog")).toBeNull();
  },
};

// Interaction test for the default Command component
export const WithInteractionTest: Story = {
  render: (args) => (
    <Command {...args} className="w-[450px] rounded-lg border shadow-md">
      {commandContent}
    </Command>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(/Type a command or search.../i);

    // Test typing and filtering
    await userEvent.type(input, "Set");

    // Check filtered items
    const calendarItem = canvas.queryByText("Calendar");
    const settingsItem = canvas.getByText("Settings"); // Assumes unique text
    const profileItem = canvas.getByText("Profile");
    expect(calendarItem).toBeNull(); // Or .not.toBeVisible()
    expect(settingsItem).toBeVisible();
    expect(profileItem).toBeVisible();

    // Test keyboard navigation (ArrowDown)
    await fireEvent.keyDown(input, { key: "ArrowDown", code: "ArrowDown" });
    // Check if the first item ('Profile' in this case) is selected
    // This requires checking data attributes set by cmdk, e.g., data-selected="true"
    const profileItemElement = canvas
      .getByText("Profile")
      .closest("[cmdk-item]");
    expect(profileItemElement).toHaveAttribute("data-selected", "true");

    // Test selecting with Enter
    await fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    // Check if the onSelect function for 'Profile' was called
    // This requires spying on the onSelect function passed to CommandItem
    // await expect(mockOnSelectProfile).toHaveBeenCalled(); // Assuming mockOnSelectProfile was passed

    // Test showing empty state
    await userEvent.clear(input);
    await userEvent.type(input, "nonexistentcommand");
    const emptyState = await canvas.findByText("No results found.");
    expect(emptyState).toBeVisible();
  },
};
