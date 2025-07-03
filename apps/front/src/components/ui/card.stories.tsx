import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button"; // Import Button for actions/footer
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "UI/Card",
  component: Card, // Use Card as the main component for the story
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  // Subcomponents can be documented or controlled if needed, but often showing usage is enough.
  // argTypes: { ... }
  args: {
    // Default args for the Card wrapper itself, e.g., className
    className: "w-[350px]", // Example width for better visualization
  },
} satisfies Meta<typeof Card>;

export default meta;

// Define a template or base story structure
const Template: StoryObj<typeof meta> = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card.</p>
        <p>It can contain various elements like text, images, or forms.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
};

export const Default: StoryObj<typeof meta> = {
  ...Template,
  args: {
    // You can override or add args specific to this story here
  },
};

export const WithHeaderAction: StoryObj<typeof meta> = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <div>
          {" "}
          {/* Added div to group title and description for layout */}
          <CardTitle>Notifications</CardTitle>
          <CardDescription>You have 3 unread messages.</CardDescription>
        </div>
        <CardAction>
          <Button variant="secondary" size="sm">
            Mark all as read
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>List of notifications would go here...</p>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="ghost">
          View settings
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const SimpleContent: StoryObj<typeof meta> = {
  render: (args) => (
    <Card {...args}>
      <CardContent>
        <p>This card only has content, no header or footer.</p>
      </CardContent>
    </Card>
  ),
};

export const WithOnlyHeader: StoryObj<typeof meta> = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>All systems operational.</CardDescription>
      </CardHeader>
    </Card>
  ),
};

// Example of adding interaction test if there were interactive elements
// export const InteractiveCard: StoryObj<typeof meta> = {
//   render: (args) => ( /* ... card with a button ... */ ),
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);
//     const button = canvas.getByRole('button', { name: /Action/i });
//     await userEvent.click(button);
//     // Add assertions here
//   },
// };
