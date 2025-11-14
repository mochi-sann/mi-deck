import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NoteComposerDialog } from "./NoteComposerDialog";
import type { NoteComposerDialogProps } from "../lib/note-composer-types";

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
