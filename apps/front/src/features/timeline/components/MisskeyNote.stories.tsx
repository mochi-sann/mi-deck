import type { Meta, StoryObj } from "@storybook/react-vite";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { Note } from "misskey-js/entities.js";
import { HttpResponse, http } from "msw";
import type { CustomEmojiContext } from "@/types/emoji";
import {
  type NsfwBehavior,
  timelineSettingsAtom,
} from "../../settings/stores/timelineSettings";
import { MisskeyNoteDisplay } from "./MisskeyNote";

const HydrateAtoms = ({
  initialValues,
  children,
}: {
  initialValues: [
    typeof timelineSettingsAtom,
    { nsfwBehavior: NsfwBehavior },
  ][];
  children: React.ReactNode;
}) => {
  useHydrateAtoms(new Map(initialValues));
  return <>{children}</>;
};

const withNsfwSettings = (behavior: NsfwBehavior) => (Story: any) => (
  <Provider>
    <HydrateAtoms
      initialValues={[[timelineSettingsAtom, { nsfwBehavior: behavior }]]}
    >
      <Story />
    </HydrateAtoms>
  </Provider>
);

const meta = {
  title: "Parts/MisskeyNote",
  component: MisskeyNoteDisplay,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  // decorators: [withStoryProviders],
} satisfies Meta<typeof MisskeyNoteDisplay>;

export default meta;
type Story = StoryObj<typeof MisskeyNoteDisplay>;

const storyOrigin = "local-misskey.local";

const buildEmojiArgs = (note: Note, origin = storyOrigin) => {
  const mergedEmojis: Record<string, string> = {
    ...(note.emojis ?? {}),
    ...(note.user?.emojis ?? {}),
  };

  const contextValue: CustomEmojiContext = {
    host: origin,
    emojis: mergedEmojis,
  };

  return {
    origin,
    emojis: mergedEmojis,
    contextValue,
  };
};

const buildStoryArgs = (note: Note, origin = storyOrigin) => ({
  note,
  ...buildEmojiArgs(note, origin),
});

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
    avatarUrl: "",
  },
};

const renoteSample: Note = {
  ...basicNote,
  id: "note-renote",
  text: null,
  renoteId: "note-original-renote",
  renote: {
    ...basicNote,
    id: "note-original-renote",
    text: "こちらがリノート元の投稿です。画像や詳細もここに入ります。",
    user: {
      ...basicNote.user,
      id: "user-2",
      username: "sourceuser",
      name: "元ノート投稿者",
    },
    files: noteWithImage.files,
  },
  user: {
    ...basicNote.user,
    id: "user-3",
    username: "renoter",
    name: "リノートした人",
  },
};
// リノート例
const quateRenoteSample: Note = {
  ...basicNote,
  id: "note-renote",
  text: "引用元への短いコメントと一緒にリノートしました。",
  renoteId: "note-original-renote",
  renote: {
    ...basicNote,
    id: "note-original-renote",
    text: "こちらがリノート元の投稿です。画像や詳細もここに入ります。",
    user: {
      ...basicNote.user,
      id: "user-2",
      username: "sourceuser",
      name: "元ノート投稿者",
    },
    files: noteWithImage.files,
  },
  user: {
    ...basicNote.user,
    id: "user-3",
    username: "renoter",
    name: "リノートした人",
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
      "note-renote": quateRenoteSample,
    };
    return HttpResponse.json(notes[id as keyof typeof notes]);
  }),
];

export const Basic: Story = {
  args: buildStoryArgs(basicNote),
  parameters: {
    msw: {
      handlers,
    },
  },
};

export const WithImage: Story = {
  args: buildStoryArgs(noteWithImage),
  parameters: {
    msw: {
      handlers,
    },
  },
};

export const WithMultipleImages: Story = {
  args: buildStoryArgs(noteWithMultipleImages),
  parameters: {
    msw: {
      handlers,
    },
  },
};

export const LongText: Story = {
  args: buildStoryArgs(longNote),
  parameters: {
    msw: {
      handlers,
    },
  },
};

export const WithoutAvatar: Story = {
  args: buildStoryArgs(noteWithoutAvatar),
  parameters: {
    msw: {
      handlers,
    },
  },
};

export const Renote: Story = {
  args: buildStoryArgs(renoteSample),
  parameters: {
    msw: {
      handlers,
    },
  },
};
export const QueteRenote: Story = {
  args: buildStoryArgs(quateRenoteSample),
  parameters: {
    msw: {
      handlers,
    },
  },
};
export const SearchText: Story = {
  args: buildStoryArgs({
    ...basicNote,
    id: "note-4",
    text: "ほげ 検索",
  }),
  parameters: {
    msw: {
      handlers,
    },
  },
};

// Text Wrapping Examples
export const LongEnglishText: Story = {
  args: buildStoryArgs({
    ...basicNote,
    id: "note-long-english",
    text:
      "VeryLongWordWithoutSpaces".repeat(15) +
      " This demonstrates how English text is wrapped without aggressive breaking to maintain readability.",
  }),
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "英語テキストでは break-all を使用せず、自然な単語境界で折り返されます。読みやすさが保たれます。",
      },
    },
    msw: {
      handlers,
    },
  },
};

export const LongJapaneseText: Story = {
  args: buildStoryArgs({
    ...basicNote,
    id: "note-long-japanese",
    text:
      "これは日本語の長いテキストの例です。" +
      "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん。".repeat(
        8,
      ) +
      "日本語では積極的な文字分割により横スクロールを防止します。",
  }),
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "日本語テキストでは break-all が適用され、積極的に文字分割されて横スクロールを防ぎます。",
      },
    },
    msw: {
      handlers,
    },
  },
};

export const MixedLanguageWithLongUrl: Story = {
  args: buildStoryArgs({
    ...basicNote,
    id: "note-mixed-url",
    text: "さくらインターネット株式会社の最新ニュースリリース https://www.sakura.ad.jp/corporate/information/newsreleases/2025/07/28/1968220370/ についての詳しい情報です。この長いURLを含むテキストでも適切に折り返し処理が行われます。",
  }),
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "日本語を含む混合テキスト（長いURLを含む）では、日本語の割合に基づいて適切な折り返し方法が選択されます。",
      },
    },
    msw: {
      handlers,
    },
  },
};

export const EnglishWithLongUrl: Story = {
  args: buildStoryArgs({
    ...basicNote,
    id: "note-english-url",
    text: "Please visit our comprehensive documentation website at https://example.com/very/long/documentation/path/that/might/cause/horizontal/scrolling/issues/in/timeline/components/if/not/handled/properly/index.html for detailed information about our platform features and API usage guidelines.",
  }),
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "英語中心のテキスト（長いURLを含む）では、break-all を使用せずに自然な折り返しが行われ、単語の完全性が保たれます。",
      },
    },
    msw: {
      handlers,
    },
  },
};

export const TimelineWrappingDemo: Story = {
  args: buildStoryArgs({
    ...basicNote,
    id: "note-timeline-demo",
    text: "タイムライン表示での文字折り返しのデモ。非常に長い単語やURLが含まれていても横スクロールが発生しないように最適化されています。 https://example.com/extremely/long/url/path/that/could/potentially/cause/layout/issues ここに日本語テキストが続きます。",
  }),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "実際のタイムライン表示での文字折り返し動作を確認できます。",
      },
    },
    msw: {
      handlers,
    },
  },
};

// NSFW Examples
const nsfwNote: Note = {
  ...noteWithImage,
  id: "note-nsfw",
  files: [
    {
      ...(noteWithImage.files?.[0] ?? {}),
      isSensitive: true,
    } as any,
  ],
};

export const NsfwBlur: Story = {
  args: buildStoryArgs(nsfwNote),
  decorators: [withNsfwSettings("blur")],
  parameters: {
    msw: {
      handlers,
    },
  },
};

export const NsfwHide: Story = {
  args: buildStoryArgs(nsfwNote),
  decorators: [withNsfwSettings("hide")],
  parameters: {
    msw: {
      handlers,
    },
  },
};

export const NsfwShow: Story = {
  args: buildStoryArgs(nsfwNote),
  decorators: [withNsfwSettings("show")],
  parameters: {
    msw: {
      handlers,
    },
  },
};
