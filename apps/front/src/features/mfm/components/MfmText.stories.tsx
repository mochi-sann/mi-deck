import { Meta, StoryObj } from "@storybook/react-vite";
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
    text: String.raw`
    <center>MisskeyでFediverseの世界が広がります</center>
react-mfm [search]
hi @user@example.org ! #React #MFM
> MisskeyでFediverseの世界が広がります
$[font.serif MisskeyでFediverseの世界が広がります]
$[font.monospace MisskeyでFediverseの世界が広がります]
$[font.cursive MisskeyでFediverseの世界が広がります]
$[font.fantasy MisskeyでFediverseの世界が広がります]

$[ruby Misskey ミスキー]
<center>
:misskey:
  **hello, world!**
  $[x2 🐔🍹🍣🍦]
  https://example.com:3000/hoge
</center>
\[
  (v\cdot\nabla)v
\]`,
  },
};
export const WithMath: Story = {
  args: {
    text: "Math formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
  },
};
export const Ruby: Story = {
  args: {
    text: "$[ruby hoge ほげ] $[ruby Misskey みすきー]",
  },
};

export const Complex: Story = {
  args: {
    text: "🚀 **Welcome** to *MiDeck*!\n\nThis is a complex MFM example with:\n- @mentions\n- #hashtags\n- https://example.com\n- `inline code`\n- Math: $E = mc^2$\n\n~~Old text~~ **New text**!",
  },
};
export const IroIro: Story = {
  args: {
    text: String.raw`

    <center>MisskeyでFediverseの世界が広がります</center>
react-mfm [search]
hi @user@example.org ! #React #MFM
> MisskeyでFediverseの世界が広がります
$[font.serif MisskeyでFediverseの世界が広がります]
$[font.monospace MisskeyでFediverseの世界が広がります]
$[font.cursive MisskeyでFediverseの世界が広がります]
$[font.fantasy MisskeyでFediverseの世界が広がります]

$[ruby Misskey ミスキー]
<center>
:misskey:
  **hello, world!**
  $[x2 🐔🍹🍣🍦]
  https://example.com:3000/hoge
</center>
\[
  (v\cdot\nabla)v
\]
@ai
@repo@p1.a9z.dev
#misskey
[example link](https://example.com)
[example link](https://example.com)
:misskey:
**太字**
<small>MisskeyでFediverseの世界が広がります</small>
> MisskeyでFediverseの世界が広がります
<center>MisskeyでFediverseの世界が広がります</center>
$[ruby Misskey ミスキー]
$[blur MisskeyでFediverseの世界が広がります]
misskey 検索
$[rotate.deg=30 misskey]
😏$[position.x=0.8,y=0.5 🍮]😀
$[scale.x=4,y=2 🍮]
$[x2 $[jelly 🍮] $[jelly.speed=5s 🍮]]
$[x2 $[tada 🍮] $[tada.speed=5s 🍮]]
$[x2 $[jump 🍮] $[jump.speed=5s 🍮]]
$[x2 $[bounce 🍮] $[bounce.speed=5s 🍮]]
$[x2 $[shake 🍮] $[shake.speed=5s 🍮]]
$[x2 $[twitch 🍮] $[twitch.speed=5s 🍮]]
$[x2 $[sparkle 🍮]]
<plain>**bold** @mention #hashtag ${"\`hoge\`"} $[x2 🍮]</plain>
@ai

\[
  (v\cdot\nabla)v
\]

`,
  },
};
