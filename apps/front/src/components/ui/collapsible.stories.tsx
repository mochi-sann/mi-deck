import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronsUpDownIcon } from "lucide-react"; // Example icon for trigger
import * as React from "react"; // Import React for useState in controlled story
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./button"; // Use Button as a trigger example
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "UI/Collapsible",
  component: Collapsible,
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
    defaultOpen: {
      control: "boolean",
      description: "Default open state (uncontrolled).",
      table: { category: "Uncontrolled" },
    },
    disabled: {
      control: "boolean",
      description: "Prevents user interaction.",
    },
    onOpenChange: { action: "openChanged", table: { category: "Controlled" } },
  },
  args: {
    // Default args for uncontrolled mode
    defaultOpen: false,
    disabled: false,
    // onOpenChange: fn(), // Add fn() if testing controlled stories primarily
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base render function for common structure
const renderCollapsible = (
  args: Story["args"],
  triggerContent: React.ReactNode,
  mainContent: React.ReactNode,
) => (
  <Collapsible {...args} className="w-[350px] space-y-2">
    <div className="flex items-center justify-between space-x-4 px-4">
      <h4 className="font-semibold text-sm">Collapsible Section Title</h4>
      <CollapsibleTrigger asChild>{triggerContent}</CollapsibleTrigger>
    </div>
    <div className="rounded-md border px-4 py-3 font-mono text-sm">
      Optional static content before collapsible area.
    </div>
    <CollapsibleContent className="space-y-2 rounded-md border p-4 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
      {mainContent}
    </CollapsibleContent>
  </Collapsible>
);

const defaultTrigger = (
  <Button variant="ghost" size="sm" className="w-9 p-0">
    <ChevronsUpDownIcon className="h-4 w-4" />
    <span className="sr-only">Toggle</span>
  </Button>
);

const defaultContent = (
  <>
    <div className="rounded-md border px-4 py-3 font-mono text-sm">
      @radix-ui/colors
    </div>
    <div className="rounded-md border px-4 py-3 font-mono text-sm">
      @stitches/react
    </div>
  </>
);

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  render: (args) => renderCollapsible(args, defaultTrigger, defaultContent),
};

export const InitiallyOpen: Story = {
  render: (args) => renderCollapsible(args, defaultTrigger, defaultContent),
  args: {
    defaultOpen: true,
  },
};

export const Disabled: Story = {
  render: (args) => renderCollapsible(args, defaultTrigger, defaultContent),
  args: {
    disabled: true,
  },
};

// Controlled example requires state management within the story
export const Controlled: Story = {
  args: {
    // Remove defaultOpen for controlled
    defaultOpen: undefined,
    open: false, // Start closed
    onOpenChange: fn(), // Use spy for controlled updates
  },
  render: function Render(args) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = React.useState(args.open);

    React.useEffect(() => {
      setIsOpen(args.open); // Sync with control changes
    }, [args.open]);

    const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      args.onOpenChange?.(open); // Call the spy
    };

    return renderCollapsible(
      { ...args, open: isOpen, onOpenChange: handleOpenChange },
      defaultTrigger,
      defaultContent,
    );
  },
};

// Story with interaction test
export const WithInteractionTest: Story = {
  args: {
    // Use uncontrolled for simpler testing unless testing controlled specifically
    defaultOpen: false,
  },
  render: (args) => renderCollapsible(args, defaultTrigger, defaultContent),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggerButton = canvas.getByRole("button", { name: /Toggle/i });
    // Content is initially hidden (or check based on defaultOpen)
    // Use queryByText which returns null if not found initially
    let contentItem = canvas.queryByText(/@radix-ui\/colors/i);
    await expect(contentItem).toBeNull(); // Or .toBeNull() if completely removed from DOM

    // Click the trigger to open
    await userEvent.click(triggerButton);

    // Content should now be visible
    // Use findByText which waits for the element to appear
    contentItem = await canvas.findByText(/@radix-ui\/colors/i);
    await expect(contentItem).toBeVisible();
    let newContetnItem = canvas.queryByRole("button");
    expect(newContetnItem).toHaveAttribute("data-state", "open");
    // const bodyitem = canvas.getByRole("#radix-:rb:");
    // console.log(
    //   ...[bodyitem, "👀 [collapsible.stories.tsx:164]: bodyitem"].reverse(),
    // );

    // Click the trigger again to close
    await userEvent.click(triggerButton);
    // await waitForElementToBeRemoved(() =>
    //   canvas.getByText(/@radix-ui\/colors/i),
    // );

    // await waitFor(() => {
    //   // 例: 'animation-finished' クラスが付与されるのを待つ
    //   expect(bodyitem).toHaveClass("animation-finished");
    //   // 例: 'is-animating' クラスが削除されるのを待つ
    //   // expect(elementToAnimate).not.toHaveClass('is-animating');
    // });
    // Content should be hidden again
    // Wait for animation/state update - using findBy queries might implicitly wait
    // Or explicitly check for disappearance if needed
    // Re-querying might be necessary depending on how Radix handles visibility/DOM presence
    // contentItem = await canvas.findByText(/@radix-ui\/colors/i);
    // await expect(contentItem).toBeNull();
    newContetnItem = canvas.queryByRole("button");
    expect(newContetnItem).toHaveAttribute("data-state", "closed");
  },
};
