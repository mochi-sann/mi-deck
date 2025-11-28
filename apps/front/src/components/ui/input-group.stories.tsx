import type { Meta, StoryObj } from "@storybook/react-vite";
import { AtSign, Hash, Lock, Rocket, Search } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./input-group";

const meta = {
  title: "UI/InputGroup",
  component: InputGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InputGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const combineClassNames = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

export const InlineAddons: Story = {
  render: (args) => (
    <InputGroup
      {...args}
      className={combineClassNames("w-full max-w-xl", args.className)}
    >
      <InputGroupAddon align="inline-start">https://</InputGroupAddon>
      <InputGroupInput placeholder="misskey.local" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>
          <Hash className="size-4" /> api
        </InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const WithActionButton: Story = {
  render: (args) => (
    <InputGroup
      {...args}
      className={combineClassNames("w-full max-w-xl", args.className)}
    >
      <InputGroupAddon align="inline-start">
        <Search className="size-4" />
        検索
      </InputGroupAddon>
      <InputGroupInput placeholder="ハッシュタグやユーザー名" />
      <InputGroupButton>
        <Search className="mr-2 size-4" />
        探す
      </InputGroupButton>
      <InputGroupAddon align="inline-end">
        <InputGroupText>
          <AtSign className="size-4" /> リアルタイム
        </InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const TextareaComposer: Story = {
  render: (args) => (
    <InputGroup
      {...args}
      className={combineClassNames("w-full max-w-2xl", args.className)}
    >
      <InputGroupAddon align="block-start">
        <div className="text-left">
          <p className="font-medium">下書きノート</p>
          <p className="text-muted-foreground text-sm">
            公開前に内容を整えておきましょう。
          </p>
        </div>
      </InputGroupAddon>
      <InputGroupTextarea rows={4} placeholder="ここに本文を入力" />
      <InputGroupAddon align="block-end" className="border-t">
        <div className="flex w-full flex-col gap-3 pt-1 md:flex-row md:items-center md:justify-between">
          <InputGroupText>
            <Lock className="mr-2 size-4" />
            投稿前に自分だけが閲覧できます
          </InputGroupText>
          <div className="flex items-center gap-3">
            <InputGroupText>
              <Hash className="mr-2 size-4" /> 0 / 500
            </InputGroupText>
            <InputGroupButton size="sm">
              <Rocket className="mr-2 size-4" />
              予約投稿
            </InputGroupButton>
          </div>
        </div>
      </InputGroupAddon>
    </InputGroup>
  ),
};
