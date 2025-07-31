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
    text: "Here's some inline `code` and a code block:\n```javascript\nconsole.log('Hello, world!');\nconsole.log('hell world');\n```",
  },
};

export const Color: Story = {
  args: {
    text: "$[fg.color=f0f 赤字]\n$[bg.color=ff0 黄背景]",
  },
};
export const CustomEmoji: Story = {
  args: {
    host: "https://misskey.mochi33.com",
    text: "こんにちは:misskey:",
    emojis: {
      misskey:
        "https://misskey.mochi33.com/proxy/image.webp?url=https%3A%2F%2Fmiiiiiiiii.mochi33.com%2F%2F2a211aaf-20b5-4656-8f28-881b24bbc993.png&emoji=1",
    },
  },
};
export const CustomEmojiAndSclae: Story = {
  args: {
    host: "https://misskey.mochi33.com",
    text: ":misskey: $[x2 :misskey: ]$[x3 :misskey:]$[x4 :misskey:]\n$[x3 misskey]\n $[scale.x=2.5 :misskey:]$[scale.y=0.5  :misskey:]$[scale.x=1.2,y=1.5  :misskey:]",
    emojis: {
      misskey:
        "https://misskey.mochi33.com/proxy/image.webp?url=https%3A%2F%2Fmiiiiiiiii.mochi33.com%2F%2F2a211aaf-20b5-4656-8f28-881b24bbc993.png&emoji=1",
    },
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

export const Sparkle: Story = {
  args: {
    text: "$[sparkle ✨ Hello World! ✨]",
  },
};
export const Many: Story = {
  args: {
    text: "$[ruby $[tada $[jelly $[shake $[spin $[bounce $[x2 $[x3 ほげ]]]]]]] ほげほげ]",
  },
};

export const Complex: Story = {
  args: {
    text: "🚀 **Welcome** to *MiDeck*!\n\nThis is a complex MFM example with:\n- @mentions\n- #hashtags\n- https://example.com\n- `inline code`\n- Math: $E = mc^2$\n\n~~Old text~~ **New text**!",
  },
};
export const ColoredBackground: Story = {
  args: {
    text: `
$[bg.color=ff0 テストテキスト ]
$[bg.color=f0f テストテキスト ]
$[bg.color=ff006f テストテキスト ]
$[bg.color=ff00 テストテキスト ]
$[bg.color=7772 半透明グレー背景]
$[bg.color=f05a 半透明ピンク背景]
$[border.width=0,radius=99 $[bg.color=7772 :blank::blank::blank:もっと見る (280文字):blank::blank::blank:]]
`,
  },
};

export const BorderStyle: Story = {
  args: {
    text: `
    $[border.style=solid,width=4 Default]

$[border.style=hidden No border]

$[border.style=dotted,width=2 Dotted]
$[border.style=dashed,width=2 Dashed]
$[border.style=double,width=4 Double]

$[border.style=groove,width=4 Embossed A]
$[border.style=ridge,width=4 Embossed B]

$[border.style=inset,width=4 Inset A]
$[border.style=outset,width=4 Inset B]

$[border.color=d00 Border color]
$[border.width=5 Border width]

$[border.radius=6,width=2 Border radius]

$[border.radius=5,width=2,color=888 $[position.x=1.5 ＣＳＳ]
$[position.x=1.5 完全に理解した]]

$[border.radius=5,width=2,color=888,noclip $[position.x=1.5 ＣＳＳ]
$[position.x=1.5 完全に理解した]]
    `,
  },
};
export const Flip: Story = {
  args: {
    text: `
    $[flip MisskeyでFediverseの世界が広がります]
$[flip.v MisskeyでFediverseの世界が広がります]
$[flip.h,v MisskeyでFediverseの世界が広がります]
    `,
  },
};
export const FourDigitColorBackground: Story = {
  args: {
    text: `
$[bg.color=ff00 半透明黄色背景（透明度0）]
$[bg.color=ff08 半透明黄色背景（透明度0.533）]
$[bg.color=ff0f 黄色背景（透明度1）]
$[bg.color=f05a ピンク系半透明背景]
$[bg.color=7772 グレー系半透明背景]
$[bg.color=00f8 青系半透明背景]
$[bg.color=0f0c 緑系半透明背景]
$[bg.color=f008 赤系半透明背景]
    `,
  },
};
export const IroIro: Story = {
  args: {
    emojis: {
      misskey:
        "https://misskey.mochi33.com/proxy/image.webp?url=https%3A%2F%2Fmiiiiiiiii.mochi33.com%2F%2F2a211aaf-20b5-4656-8f28-881b24bbc993.png&emoji=1",
    },
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
$[fg.color=f0f 赤字]
$[bg.color=ff0 黄背景]
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
$[ruby Misskey :misskey:]
$[blur MisskeyでFediverse:misskey:の世界が広がります]
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
