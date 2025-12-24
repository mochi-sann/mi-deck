import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Note, UserDetailed } from "misskey-js/entities.js";
import { HttpResponse, http } from "msw";
import { UserTimelineContent } from "./UserTimelineContent";

const origin = "https://misskey.example.test";
const token = "storybook-token";
const userId = "user-1";

const mockUser = {
  id: userId,
  username: "testuser",
  name: "テストユーザー",
  host: null,
  avatarUrl: "https://picsum.photos/200",
  bannerUrl: "https://picsum.photos/1200/300",
  description: "ユーザープロフィールのサンプルです。",
  followersCount: 120,
  followingCount: 80,
  notesCount: 42,
  emojis: {},
} as UserDetailed;

const mockNotes = [
  {
    id: "note-1",
    createdAt: new Date(Date.now() - 60_000).toISOString(),
    text: "ユーザーの最新ノートです。",
    user: {
      id: userId,
      name: "テストユーザー",
      username: "testuser",
      avatarUrl: "https://picsum.photos/200",
      emojis: {},
    },
    emojis: {},
    reactionEmojis: {},
    reactions: {
      "👍": 2,
      "❤️": 1,
    },
    myReaction: null,
    files: [],
  },
  {
    id: "note-2",
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    text: "2つ目のノート。少し長めの文章で表示を確認します。",
    user: {
      id: userId,
      name: "テストユーザー",
      username: "testuser",
      avatarUrl: "https://picsum.photos/200",
      emojis: {},
    },
    emojis: {},
    reactionEmojis: {},
    reactions: {},
    myReaction: null,
    files: [],
  },
] as Note[];

const baseHandlers = [
  http.post(/\/api\/users\/show$/, () => {
    return HttpResponse.json(mockUser);
  }),
  http.post(/\/api\/users\/notes$/, async ({ request }) => {
    const body = (await request.json()) as { untilId?: string };
    if (body?.untilId) {
      return HttpResponse.json([]);
    }
    return HttpResponse.json(mockNotes);
  }),
  http.get(/\/api\/emoji$/, () => {
    return HttpResponse.json({ url: null });
  }),
];

const meta = {
  title: "Parts/Timelines/UserTimelineContent",
  component: UserTimelineContent,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  render: (args) => (
    <div className="h-[600px] w-full border rounded-md bg-background">
      <UserTimelineContent {...args} />
    </div>
  ),
} satisfies Meta<typeof UserTimelineContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    origin,
    token,
    userId,
  },
  parameters: {
    msw: {
      handlers: baseHandlers,
    },
  },
};

export const Empty: Story = {
  args: {
    origin,
    token,
    userId,
  },
  parameters: {
    msw: {
      handlers: [
        http.post(/\/api\/users\/show$/, () => {
          return HttpResponse.json(mockUser);
        }),
        http.post(/\/api\/users\/notes$/, () => {
          return HttpResponse.json([]);
        }),
        http.get(/\/api\/emoji$/, () => {
          return HttpResponse.json({ url: null });
        }),
      ],
    },
  },
};

export const UserError: Story = {
  args: {
    origin,
    token,
    userId,
  },
  parameters: {
    msw: {
      handlers: [
        http.post(/\/api\/users\/show$/, () => {
          return HttpResponse.json(
            { error: "User not found" },
            { status: 404 },
          );
        }),
        http.post(/\/api\/users\/notes$/, () => {
          return HttpResponse.json([]);
        }),
        http.get(/\/api\/emoji$/, () => {
          return HttpResponse.json({ url: null });
        }),
      ],
    },
  },
};
