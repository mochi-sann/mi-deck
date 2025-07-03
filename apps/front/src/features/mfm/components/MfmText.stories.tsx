import type { Meta, StoryObj } from "@storybook/react";
import { MfmText } from "./MfmText";

const meta = {
  title: "Features/MFM/MfmText",
  component: MfmText,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    text: {
      control: "text",
      description: "MFM text to render",
    },
  },
} satisfies Meta<typeof MfmText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    text: "Hello, **world**!",
  },
};

export const WithEmoji: Story = {
  args: {
    text: "Hello :heart: world!",
  },
};

export const WithMentions: Story = {
  args: {
    text: "Hello @username, how are you?",
  },
};

export const WithHashtags: Story = {
  args: {
    text: "Check out this #awesome #content!",
  },
};

export const WithLinks: Story = {
  args: {
    text: "Visit https://example.com for more info!",
  },
};

export const WithFormatting: Story = {
  args: {
    text: "This is **bold**, *italic*, and ~~strikethrough~~ text.",
  },
};

export const WithCode: Story = {
  args: {
    text: "Here's some inline `code` and a code block:\n```javascript\nconsole.log('Hello, world!');\n```",
  },
};

export const All: Story = {
  args: {
    text: `# こんにちは
react-mfm [search]
hi @user@example.org ! #React #MFM
<center>
:sorena:
  **hello, world!**
  $[x2 🐔🍹🍣🍦]
  https://example.com:3000/hoge
</center>
\[
  (v\cdot\nabla)v
\]
`,
  },
};
export const WithMath: Story = {
  args: {
    text: "Math formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
  },
};

export const Complex: Story = {
  args: {
    text: "🚀 **Welcome** to *MiDeck*!\n\nThis is a complex MFM example with:\n- @mentions\n- #hashtags\n- https://example.com\n- `inline code`\n- Math: $E = mc^2$\n\n~~Old text~~ **New text**!",
  },
};
