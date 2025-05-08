import type { Meta, StoryObj } from "@storybook/react";
import type { Note } from "misskey-js/entities.js";
import { TimelineNotes } from "./TimelineNotes";

const meta = {
  title: "Parts/Timelines/TimelineNotes",
  component: TimelineNotes,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TimelineNotes>;

export default meta;
type Story = StoryObj<typeof meta>;

// 最小限のモックデータ
const mockNotes = [
  {
    id: "1",
    text: "これは最初のノートです。",
    user: {
      id: "user1",
      name: "テストユーザー1",
      username: "testuser1",
    },
  },
  {
    id: "2",
    text: "これは2番目のノートです。",
    user: {
      id: "user2",
      name: "テストユーザー2",
      username: "testuser2",
    },
  },
] as Note[];

export const Loading: Story = {
  args: {
    notes: undefined,
  },
};

export const Empty: Story = {
  args: {
    notes: [],
  },
};

export const WithNotes: Story = {
  args: {
    notes: mockNotes,
  },
};
