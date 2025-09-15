import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReactionHoverContent } from "./ReactionHoverContent";

const meta = {
  title: "Features/Reactions/ReactionHoverContent",
  component: ReactionHoverContent,
  args: {
    emojis: {},
    reactionsRaw: [
      {
        id: "r1",
        type: "❤",
        user: { id: "u1", name: "Alice", username: "alice" },
        createdAt: new Date().toISOString(),
      },
      {
        id: "r2",
        type: "❤",
        user: { id: "u2", name: "Bob", username: "bob" },
        createdAt: new Date().toISOString(),
      },
      {
        id: "r3",
        type: ":custom_hello:",
        user: { id: "u3", name: "Carol", username: "carol" },
        createdAt: new Date().toISOString(),
      },
    ],
  },
} satisfies Meta<typeof ReactionHoverContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UnicodeEmoji: Story = {
  args: {
    reaction: "❤",
    isUnicodeEmoji: true,
    emojiUrl: null,
  },
};

export const CustomEmojiWithUrl: Story = {
  args: {
    reaction: ":party_parrot:",
    isUnicodeEmoji: false,
    emojiUrl:
      "https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f389.svg",
  },
};

export const CustomEmojiFromMap: Story = {
  args: {
    reaction: ":custom_hello:",
    isUnicodeEmoji: false,
    emojiUrl: null,
    emojis: {
      // biome-ignore lint/style/useNamingConvention: Story用のダミーURL
      custom_hello: "https://placehold.co/16x16/png",
    },
  },
};
