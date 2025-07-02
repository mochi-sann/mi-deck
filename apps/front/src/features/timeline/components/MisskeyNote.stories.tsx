import type { Meta, StoryObj } from "@storybook/react-vite";
import { Note } from "misskey-js/entities.js";
import { http, HttpResponse } from "msw";
import { MisskeyNote } from "./MisskeyNote";

const meta = {
  title: "Parts/MisskeyNote",
  component: MisskeyNote,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MisskeyNote>;

export default meta;
type Story = StoryObj<typeof MisskeyNote>;

// 基本的なノート
const basicNote: Note = {
  id: "note-1",
  createdAt: new Date().toISOString(),
  text: "これは基本的なノートの内容です。",
  user: {
    id: "user-1",
    username: "testuser",
    name: "テストユーザー",
    host: "example.com",
    avatarUrl: "https://picsum.photos/200",
    avatarBlurhash: null,
    avatarDecorations: [],
    isBot: false,
    isCat: false,
    onlineStatus: "online",
    badgeRoles: [],
    emojis: {},
    instance: {
      name: "example",
      softwareName: "Misskey",
      softwareVersion: "13.0.0",
      iconUrl: "https://example.com/icon.png",
      faviconUrl: "https://example.com/favicon.ico",
      themeColor: "#000000",
    },
  },
  replyId: null,
  renoteId: null,
  reply: null,
  renote: null,
  visibility: "public",
  mentions: [],
  visibleUserIds: [],
  fileIds: [],
  files: [],
  tags: [],
  poll: null,
  emojis: {},
  reactions: {},
  reactionEmojis: {},
  uri: undefined,
  url: undefined,
  userId: "user-1",
  myReaction: null,
  reactionCount: 0,
  renoteCount: 0,
  reactionAcceptance: null,
  repliesCount: 0,
};

// 画像付きノート
const noteWithImage: Note = {
  ...basicNote,
  id: "note-2",
  text: "これは画像付きのノートです。",
  files: [
    {
      id: "file-1",
      createdAt: new Date().toISOString(),
      name: "image.jpg",
      type: "image/jpeg",
      md5: "dummy-md5-hash",
      size: 1024,
      url: "https://picsum.photos/400/300",
      thumbnailUrl: "https://picsum.photos/400/300",
      isSensitive: false,
      blurhash: null,
      properties: {
        width: 400,
        height: 300,
      },
      comment: null,
      folderId: null,
      folder: null,
      userId: "user-1",
      user: null,
    },
  ],
};

// 複数画像付きノート
const noteWithMultipleImages: Note = {
  ...basicNote,
  id: "note-3",
  text: "これは複数の画像が付いたノートです。",
  files: [
    {
      id: "file-1",
      createdAt: new Date().toISOString(),
      name: "image1.jpg",
      type: "image/jpeg",
      md5: "dummy-md5-hash-1",
      size: 1024,
      url: "https://picsum.photos/400/300",
      thumbnailUrl: "https://picsum.photos/400/300",
      isSensitive: false,
      blurhash: null,
      properties: {
        width: 400,
        height: 300,
      },
      comment: null,
      folderId: null,
      folder: null,
      userId: "user-1",
      user: null,
    },
    {
      id: "file-2",
      createdAt: new Date().toISOString(),
      name: "image2.jpg",
      type: "image/jpeg",
      md5: "dummy-md5-hash-2",
      size: 1024,
      url: "https://picsum.photos/400/300",
      thumbnailUrl: "https://picsum.photos/400/300",
      isSensitive: false,
      blurhash: null,
      properties: {
        width: 400,
        height: 300,
      },
      comment: null,
      folderId: null,
      folder: null,
      userId: "user-1",
      user: null,
    },
  ],
};

// 長文のノート
const longNote: Note = {
  ...basicNote,
  id: "note-4",
  text: "これは長文のノートです。".repeat(10),
};

// アバターなしのノート
const noteWithoutAvatar: Note = {
  ...basicNote,
  id: "note-5",
  user: {
    ...basicNote.user,
    avatarUrl: null,
  },
};

// MSWのハンドラーを設定
const handlers = [
  http.get("https://example.com/api/notes/:id", ({ params }) => {
    const { id } = params;
    const notes = {
      "note-1": basicNote,
      "note-2": noteWithImage,
      "note-3": noteWithMultipleImages,
      "note-4": longNote,
      "note-5": noteWithoutAvatar,
    };
    return HttpResponse.json(notes[id as keyof typeof notes]);
  }),
];

export const Basic: Story = {
  args: {
    note: basicNote,
  },
  parameters: {
    msw: {
      handlers,
    },
  },
};

export const WithImage: Story = {
  args: {
    note: noteWithImage,
  },
  parameters: {
    msw: {
      handlers,
    },
  },
};

export const WithMultipleImages: Story = {
  args: {
    note: noteWithMultipleImages,
  },
  parameters: {
    msw: {
      handlers,
    },
  },
};

export const LongText: Story = {
  args: {
    note: longNote,
  },
  parameters: {
    msw: {
      handlers,
    },
  },
};

export const WithoutAvatar: Story = {
  args: {
    note: noteWithoutAvatar,
  },
  parameters: {
    msw: {
      handlers,
    },
  },
};
