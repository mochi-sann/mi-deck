import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import type { NoteComposerFormValues } from "../../hooks/useNoteComposer";
import { ComposerLocalOnlyField } from "./ComposerLocalOnlyField";
import { createComposerFieldIds } from "./types";

const meta = {
  title: "features/compose-dialog/ComposerLocalOnlyField",
  component: ComposerLocalOnlyField,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ComposerLocalOnlyField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const form = useForm<NoteComposerFormValues>({
      defaultValues: {
        serverSessionId: "",
        noteContent: "",
        isLocalOnly: false,
        visibility: "public",
      },
    });
    const fieldIds = createComposerFieldIds("demo");

    return (
      <Form {...form}>
        <ComposerLocalOnlyField
          form={form}
          fieldIds={fieldIds}
          disabled={false}
          t={(key: string) =>
            key === "compose.localOnlyDescription"
              ? "接続中のインスタンスのみに投稿します"
              : key
          }
        />
      </Form>
    );
  },
};
