import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { initReactI18next } from "react-i18next";
import { Button } from "@/components/ui/button";
import { NoteComposerDialog } from "./NoteComposerDialog";
import type { NoteComposerDialogProps } from "../lib/note-composer-types";

const i18n = createInstance();
i18n.use(initReactI18next).init({
  lng: "ja",
  fallbackLng: "ja",
  resources: {
    ja: {
      notes: {
        compose: {
          title: {
            create: "新しいノートを作成",
            reply: "ノートに返信",
            quote: "引用リノートを作成",
          },
          description: {
            create: "ノートの内容を入力してください。",
            reply: "返信内容を入力してください。",
            quote: "引用に追加するテキストを入力してください。",
          },
          success: {
            create: "ノートを投稿しました",
            reply: "返信を送信しました",
            quote: "引用リノートを投稿しました",
          },
          serverLabel: "投稿先サーバー",
          emojiInsert: "絵文字を挿入",
          emojiPickerPlaceholder: "サーバーを選択すると絵文字を挿入できます",
          attachmentsLabel: "添付ファイル",
          attachmentsDescription: "画像やファイルを追加",
          attachmentsEmpty: "ファイルは未選択です",
          contentLabel: "ノート内容",
        },
      },
      timeline: {
        renote: {
          button: {
            default: "リノート",
            active: "リノート済み",
            unavailable: "利用不可",
          },
          dialog: {
            title: "リノート",
            description: "リノート先のサーバーを選択してください",
            cancel: "キャンセル",
            action: "送信",
            serverLabel: "投稿先サーバー",
            serverLoading: "サーバーを読み込み中",
            serverPlaceholder: "サーバーを選択",
          },
          error: {
            noServer: "利用可能なサーバーがありません",
          },
          unavailable: "リノートできません",
        },
      },
    },
  },
});

const meta = {
  title: "features/compose-dialog/NoteComposerDialog",
  component: NoteComposerDialog,
  args: {
    mode: "create",
    showSuccessMessage: true,
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    ),
  ],
} satisfies Meta<typeof NoteComposerDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

const Template = (args: NoteComposerDialogProps) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Composer</Button>
      <NoteComposerDialog
        {...args}
        open={open}
        onOpenChange={setOpen}
        origin="https://misskey.example"
      />
    </div>
  );
};

export const Default: Story = {
  render: Template,
};

export const ReplyMode: Story = {
  args: {
    mode: "reply",
    replyTarget: {
      id: "note-1",
      createdAt: new Date().toISOString(),
      text: "サンプルのノート本文",
      user: {
        id: "user-1",
        username: "alice",
        name: "Alice",
        host: "misskey.example",
      },
    },
  },
  render: Template,
};
