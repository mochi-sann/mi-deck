import type { Meta, StoryObj } from "@storybook/react-vite";
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

const mockNotesWithImages = [
  {
    id: "3",
    text: "画像付きのノートです。",
    user: {
      id: "user3",
      name: "テストユーザー3",
      username: "testuser3",
    },
    files: [
      {
        id: "file1",
        name: "image1.jpg",
        type: "image/jpeg",
        url: "https://picsum.photos/400/300",
        thumbnailUrl: "https://picsum.photos/400/300",
        size: 1024,
      },
    ],
  },
  {
    id: "4",
    text: "複数画像付きのノートです。",
    user: {
      id: "user4",
      name: "テストユーザー4",
      username: "testuser4",
    },
    files: [
      {
        id: "file2",
        name: "image2.jpg",
        type: "image/jpeg",
        url: "https://picsum.photos/400/300",
        thumbnailUrl: "https://picsum.photos/400/300",
        size: 1024,
      },
      {
        id: "file3",
        name: "image3.jpg",
        type: "image/jpeg",
        url: "https://picsum.photos/400/300",
        thumbnailUrl: "https://picsum.photos/400/300",
        size: 1024,
      },
    ],
  },
] as Note[];

export const Loading: Story = {
  args: {
    notes: undefined,
    origin: "https://misskey.mochi33.com",
  },
};

export const Empty: Story = {
  args: {
    notes: [],
    origin: "https://misskey.mochi33.com",
  },
};

export const WithNotes: Story = {
  args: {
    notes: mockNotes,
    origin: "https://misskey.mochi33.com",
  },
};

export const WithImages: Story = {
  args: {
    notes: mockNotesWithImages,
    origin: "https://misskey.mochi33.com",
  },
};
