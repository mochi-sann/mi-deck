import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebarPresenter } from "./AppSidebar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
});

const meta = {
  title: "Layout/AppSidebarPresenter",
  component: AppSidebarPresenter,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <SidebarProvider>
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof AppSidebarPresenter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: {
      id: "1",
      name: "テストユーザー",
      email: "test@example.com",
      isAuth: true,
      avatarUrl: "",
    },
  },
};
