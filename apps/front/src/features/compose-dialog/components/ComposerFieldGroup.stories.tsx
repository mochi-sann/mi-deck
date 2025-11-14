import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@/components/ui/input";
import Text from "@/components/ui/text";
import { ComposerFieldGroup } from "./ComposerFieldGroup";

const meta = {
  title: "features/compose-dialog/ComposerFieldGroup",
  component: ComposerFieldGroup,
  args: {
    label: "ノート本文",
    description: "ここにノート内容を入力します",
    status: <Text affects="small">140 / 3000</Text>,
    error: undefined,
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ComposerFieldGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[480px]">
      <ComposerFieldGroup {...args}>
        <Input placeholder="メモを入力" />
      </ComposerFieldGroup>
    </div>
  ),
};

export const WithError: Story = {
  args: {
    error: "入力が必須です",
    status: <Text affects="small" className="text-destructive">残り 0 文字</Text>,
  },
  render: (args) => (
    <div className="w-[480px]">
      <ComposerFieldGroup {...args}>
        <Input aria-invalid placeholder="入力してください" />
      </ComposerFieldGroup>
    </div>
  ),
};
