import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import type { NoteComposerFormValues } from "../../hooks/useNoteComposer";
import { ComposerAttachmentsField } from "./ComposerAttachmentsField";
import { createComposerFieldIds } from "./types";

const meta = {
  title: "features/compose-dialog/ComposerAttachmentsField",
  component: ComposerAttachmentsField,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ComposerAttachmentsField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    const fieldIds = createComposerFieldIds("demo");
    const form = useForm<NoteComposerFormValues>({
      defaultValues: {
        serverSessionId: "",
        noteContent: "",
        isLocalOnly: false,
        visibility: "public",
      },
    });

    return (
      <Form {...form}>
        <ComposerAttachmentsField
          t={(key: string) =>
            key === "compose.attachmentsLabel"
              ? "添付ファイル"
              : key === "compose.attachmentsDescription"
                ? "画像やファイルを追加"
                : key
          }
          files={files}
          fileStatusText={
            files.length ? `${files.length} 件を選択` : "ファイル未選択"
          }
          description="画像やファイルを追加"
          fieldIds={fieldIds}
          disabled={false}
          onFilesChange={setFiles}
          registerFileInput={() => {}}
        />
      </Form>
    );
  },
};
