import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import { ComposerFieldActions } from "./ComposerFieldActions";

const sampleServers: MisskeyServerConnection[] = [
  {
    id: "server-1",
    origin: "https://misskey.example",
    accessToken: "token",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    userInfo: {
      id: "user-1",
      username: "alice",
      name: "Alice",
      avatarUrl: "https://dummyimage.com/60x60/1fc8e1/000000.png&text=A",
    },
  },
];

const visibilityOptions = [
  { value: "public", label: "公開" },
  { value: "home", label: "ホーム" },
  { value: "followers", label: "フォロワー" },
];

const meta = {
  title: "features/compose-dialog/ComposerFieldActions",
  component: ComposerFieldActions,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ComposerFieldActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [serverOpen, setServerOpen] = useState(false);
    const [visibilityOpen, setVisibilityOpen] = useState(false);
    const [emojiOpen, setEmojiOpen] = useState(false);
    const [currentVisibility, setCurrentVisibility] = useState("public");
    const [selectedServerId, setSelectedServerId] = useState("server-1");

    return (
      <ComposerFieldActions
        t={(key: string) => key}
        serversWithToken={sampleServers}
        visibilityOptions={visibilityOptions}
        isServerPopoverOpen={serverOpen}
        onServerPopoverChange={setServerOpen}
        isVisibilityPopoverOpen={visibilityOpen}
        onVisibilityPopoverChange={setVisibilityOpen}
        isEmojiPickerOpen={emojiOpen}
        onEmojiPickerChange={setEmojiOpen}
        formDisabled={false}
        isLoadingServers={false}
        selectedServer={sampleServers.find((s) => s.id === selectedServerId)}
        serverButtonLabel="投稿先サーバー"
        visibilityButtonLabel="公開範囲"
        currentVisibility={currentVisibility}
        emojiOrigin="https://misskey.example"
        canUseEmoji
        onServerSelect={setSelectedServerId}
        onVisibilitySelect={setCurrentVisibility}
        onEmojiSelect={() => setEmojiOpen(false)}
        onOpenFileSelector={() => undefined}
        getServerDisplayName={(server) =>
          server.userInfo?.name ?? server.origin
        }
        getServerSubtitle={(server) =>
          server.origin.replace(/^https?:\/\//, "")
        }
      />
    );
  },
};
