import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inbox, NotebookPen, Rocket } from "lucide-react";

import { Button } from "./button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";

const meta = {
  title: "UI/Empty",
  component: Empty,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Empty>;

export default meta;

type Story = StoryObj<typeof meta>;

const combineClassNames = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

export const Default: Story = {
  render: (args) => (
    <Empty
      {...args}
      className={combineClassNames(
        "min-h-[320px] w-full max-w-xl",
        args.className,
      )}
    >
      <EmptyHeader>
        <EmptyTitle>タイムラインが空です</EmptyTitle>
        <EmptyDescription>
          フォローするアカウントやサーバーを追加すると、ここにノートが表示されます。
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">フォロー候補を見る</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <Empty
      {...args}
      className={combineClassNames(
        "min-h-[360px] w-full max-w-xl",
        args.className,
      )}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-primary/5 text-primary">
          <Inbox className="size-6" />
        </EmptyMedia>
        <EmptyTitle>通知はすべて確認済みです</EmptyTitle>
        <EmptyDescription>
          新しいメッセージが届くとここに表示されます。しばらく待つか別のタブを開いてみてください。
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant="secondary">
          フィルターを調整
        </Button>
      </EmptyContent>
    </Empty>
  ),
};

export const WithActions: Story = {
  render: (args) => (
    <Empty
      {...args}
      className={combineClassNames(
        "min-h-[360px] w-full max-w-2xl",
        args.className,
      )}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-muted text-muted-foreground">
          <NotebookPen className="size-6" />
        </EmptyMedia>
        <EmptyTitle>まだカスタムタイムラインがありません</EmptyTitle>
        <EmptyDescription>
          <span>
            作成したタイムラインがここに並びます。仕組みについては{" "}
            <a href="https://example.com">ドキュメント</a> を参照してください。
          </span>
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>
          <Rocket className="mr-2 size-4" />
          新しいタイムラインを作成
        </Button>
        <Button variant="ghost" size="sm">
          テンプレートを読み込む
        </Button>
      </EmptyContent>
    </Empty>
  ),
};
