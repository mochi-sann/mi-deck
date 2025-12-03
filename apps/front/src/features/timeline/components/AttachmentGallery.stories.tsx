import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TimelineSettings } from "@/features/settings/stores/timelineSettings";

import type { NoteFile } from "./NoteAttachmentTypes";
import { AttachmentGallery } from "./AttachmentGallery";

const meta = {
  title: "Parts/Timeline/AttachmentGallery",
  component: AttachmentGallery,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AttachmentGallery>;

export default meta;
type Story = StoryObj<typeof AttachmentGallery>;

const sampleFiles: NoteFile[] = [
  {
    id: "file-1",
    name: "landscape.png",
    type: "image/png",
    url: "https://picsum.photos/seed/1/640/480",
    thumbnailUrl: "https://picsum.photos/seed/1/160/120",
    size: 123_456,
  },
  {
    id: "file-2",
    name: "portrait.jpg",
    type: "image/jpeg",
    url: "https://picsum.photos/seed/2/640/480",
    thumbnailUrl: "https://picsum.photos/seed/2/160/120",
    size: 234_567,
  },
];

const neutralSettings: TimelineSettings = { nsfwBehavior: "show" };
const blurSettings: TimelineSettings = { nsfwBehavior: "blur" };

const noop = () => {};

export const Default: Story = {
  args: {
    files: sampleFiles,
    settings: neutralSettings,
    isNsfw: false,
    isRevealed: true,
    onAttachmentClick: noop,
  },
};

export const NsfwBlurred: Story = {
  args: {
    files: sampleFiles,
    settings: blurSettings,
    isNsfw: true,
    isRevealed: false,
    onAttachmentClick: noop,
  },
};
