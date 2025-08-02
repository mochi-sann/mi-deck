import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ServerInfo, TimelineConfig } from "@/lib/storage/types";
import { ClientTimelineListPresenter } from "./ClientTimelineListPresenter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
});

// Mock data
const mockServers: ServerInfo[] = [
  {
    id: "server-1",
    origin: "https://misskey.mochi33.com",
    accessToken: "mock-token",
    name: "Mochi's Misskey",
    serverInfo: {
      name: "Mochi's Server",
      version: "13.14.0",
      description: "テスト用のMisskeyサーバー",
      maintainerName: "Mochi",
      maintainerEmail: "mochi@example.com",
      iconUrl: "https://picsum.photos/32/32",
      bannerUrl: "https://picsum.photos/400/200",
      languages: ["ja"],
      tosUrl: null,
      privacyPolicyUrl: null,
      maxNoteTextLength: 3000,
      features: {
        registration: true,
        localTimeline: true,
        globalTimeline: true,
        emailRequiredForSignup: false,
        hcaptcha: false,
        recaptcha: false,
        turnstile: false,
        enableMcaptcha: false,
        objectStorage: false,
        serviceWorker: false,
      },
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "server-2",
    origin: "https://misskey.io",
    accessToken: "mock-token-2",
    name: "Misskey.io",
    serverInfo: {
      name: "Misskey.io",
      version: "13.14.0",
      description: "The main Misskey instance",
      maintainerName: "syuilo",
      maintainerEmail: "syuilo@misskey.io",
      iconUrl: "https://picsum.photos/32/32?random=2",
      bannerUrl: "https://picsum.photos/400/200?random=2",
      languages: ["ja", "en"],
      tosUrl: null,
      privacyPolicyUrl: null,
      maxNoteTextLength: 3000,
      features: {
        registration: true,
        localTimeline: true,
        globalTimeline: true,
        emailRequiredForSignup: false,
        hcaptcha: false,
        recaptcha: false,
        turnstile: false,
        enableMcaptcha: false,
        objectStorage: false,
        serviceWorker: false,
      },
    },
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
];

const mockTimelines: TimelineConfig[] = [
  {
    id: "timeline-1",
    name: "ホーム",
    type: "HOME",
    serverId: "server-1",
    isVisible: true,
    order: 0,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "timeline-2",
    name: "ローカル",
    type: "LOCAL",
    serverId: "server-1",
    isVisible: true,
    order: 1,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "timeline-3",
    name: "グローバル",
    type: "GLOBAL",
    serverId: "server-2",
    isVisible: true,
    order: 2,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Default handlers
const defaultHandlers = {
  onDragEnd: () => {},
  onDeleteTimeline: () => {},
  onOpenDialog: () => {},
  onCloseDialog: () => {},
  onDialogSuccess: () => {},
};

const meta = {
  title: "Features/Timeline/ClientTimelineListPresenter",
  component: ClientTimelineListPresenter,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof ClientTimelineListPresenter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    timelines: [],
    servers: [],
    isLoading: true,
    retryCount: 1,
    isDeleting: false,
    isDialogOpen: false,
    ...defaultHandlers,
  },
};

export const Empty: Story = {
  args: {
    timelines: [],
    servers: [],
    isLoading: false,
    retryCount: 0,
    isDeleting: false,
    isDialogOpen: false,
    ...defaultHandlers,
  },
};

export const WithTimelines: Story = {
  args: {
    timelines: mockTimelines,
    servers: mockServers,
    isLoading: false,
    retryCount: 0,
    isDeleting: false,
    isDialogOpen: false,
    ...defaultHandlers,
  },
};

export const NoServers: Story = {
  args: {
    timelines: [],
    servers: [],
    isLoading: false,
    retryCount: 0,
    isDeleting: false,
    isDialogOpen: false,
    ...defaultHandlers,
  },
};

export const WithDialogOpen: Story = {
  args: {
    timelines: mockTimelines,
    servers: mockServers,
    isLoading: false,
    retryCount: 0,
    isDeleting: false,
    isDialogOpen: true,
    ...defaultHandlers,
  },
};

export const Deleting: Story = {
  args: {
    timelines: mockTimelines,
    servers: mockServers,
    isLoading: false,
    retryCount: 0,
    isDeleting: true,
    isDialogOpen: false,
    ...defaultHandlers,
  },
};
