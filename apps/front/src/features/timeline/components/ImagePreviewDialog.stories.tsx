import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import type { NoteFile } from "./NoteAttachmentTypes";

const meta = {
  title: "Parts/Timeline/ImagePreviewDialog",
  component: ImagePreviewDialog,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ImagePreviewDialog>;

export default meta;
type Story = StoryObj<typeof ImagePreviewDialog>;

const sampleFile: NoteFile = {
  id: "preview-file",
  name: "sunset.jpg",
  type: "image/jpeg",
  url: "https://picsum.photos/seed/preview/800/600",
  thumbnailUrl: "https://picsum.photos/seed/preview/200/150",
  size: 512_000,
};

const Template: Story = {
  render: ({ file: initialFile }) => {
    const [file, setFile] = useState<NoteFile | null>(initialFile ?? null);

    return (
      <div className="flex flex-col items-start gap-4 px-4 py-8">
        <button
          type="button"
          className="rounded-lg border px-4 py-2"
          onClick={() => setFile(sampleFile)}
        >
          Open Preview
        </button>
        <ImagePreviewDialog file={file} onClose={() => setFile(null)} />
      </div>
    );
  },
};

export const Closed: Story = {
  ...Template,
  args: {
    file: null,
  },
};

export const Open: Story = {
  ...Template,
  args: {
    file: sampleFile,
  },
};
