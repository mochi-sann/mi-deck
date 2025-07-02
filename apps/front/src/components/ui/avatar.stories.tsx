import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "UI/Avatar",
  component: Avatar, // Use Avatar as the main component
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    // Args for Avatar Root
    className: {
      control: "text",
      description: "Apply custom classes, e.g., for size (size-10, size-12)",
    },
    // Note: src, alt, and fallback content are controlled within each story's render function
  },
  args: {
    // Default args for the Avatar wrapper
    className: "size-10", // Default size for stories
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    // Inherits default className from meta.args
  },
  render: (args: Story["args"]) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  args: {
    // Inherits default className
  },
  render: (args: Story["args"]) => (
    <Avatar {...args}>
      <AvatarImage src="invalid-image-url" alt="User Avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Large: Story = {
  args: {
    className: "size-16", // Override size
  },
  render: (args: Story["args"]) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
      <AvatarFallback>VC</AvatarFallback>
    </Avatar>
  ),
};

export const Small: Story = {
  args: {
    className: "size-6", // Override size
  },
  render: (args: Story["args"]) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/github.png" alt="@github" />
      <AvatarFallback>GH</AvatarFallback>
    </Avatar>
  ),
};

// Interaction test example (less common for Avatar, but possible)
// export const TestFallbackDisplay: Story = {
//   args: {
//      className: "size-10", // Example size for test
//   },
//   render: (args) => (
//     <Avatar {...args}>
//       <AvatarImage src="invalid-image-url" alt="Test" />
//       <AvatarFallback>FB</AvatarFallback> {/* Specific fallback for test */}
//     </Avatar>
//   ),
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);
//     // Check if fallback is rendered when image fails
//     // Note: Radix handles this internally, direct testing might be complex.
//     // A visual regression test might be more appropriate here.
//     const fallback = await canvas.findByText("FB");
//     await expect(fallback).toBeInTheDocument();
//   },
// };
