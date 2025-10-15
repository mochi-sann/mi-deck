import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Note } from "misskey-js/entities.js";
import { ReplyTargetPreview } from "./ReplyTargetPreview";

const baseNote: Note = {
  id: "note-1",
  createdAt: "2025-10-12T03:00:00.000Z",
  text: "これは返信先ノートの本文です。テストのためのサンプルコンテンツを表示しています。",
  user: {
    id: "user-1",
    username: "tester",
    name: "テスター",
    host: "misskey.example",
    avatarUrl: "https://placehold.co/64x64",
    emojis: {},
  },
  visibility: "public",
  reactionEmojis: {},
  emojis: {},
  reactions: {},
  renoteCount: 0,
  repliesCount: 0,
  files: [],
  renoteId: null,
  renote: null,
  app: null,
  cw: null,
  uri: null,
  url: null,
  localOnly: false,
  viaMobile: false,
  tags: [],
  mentions: [],
  replies: [],
};

const meta = {
  title: "Notes/ReplyTargetPreview",
  component: ReplyTargetPreview,
  args: {
    note: baseNote,
    origin: "https://misskey.example",
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ReplyTargetPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAttachments: Story = {
  args: {
    note: {
      ...baseNote,
      files: [
        {
          id: "file-1",
          type: "image/jpeg",
          url: "https://placehold.co/600x400",
          thumbnailUrl: "https://placehold.co/300x200",
          name: "preview-image.jpg",
          isSensitive: false,
          blurhash: "",
          size: 123456,
          properties: {},
          createdAt: baseNote.createdAt,
          updatedAt: baseNote.createdAt,
          userId: baseNote.user.id,
          user: baseNote.user,
          folderId: null,
          folder: null,
          comment: null,
          src: "https://placehold.co/600x400",
          md5: "sample",
          urlExpiresAt: null,
          uri: null,
          deletedAt: null,
          isLink: false,
          variant: {
            thumb: "https://placehold.co/300x200",
            webpublic: "https://placehold.co/600x400",
          },
        },
      ],
    } as Note,
  },
};

export const WithoutText: Story = {
  args: {
    note: {
      ...baseNote,
      text: "",
    },
  },
};
