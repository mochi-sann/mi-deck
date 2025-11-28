import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "./field";
import { Input } from "./input";
import { Switch } from "./switch";
import { Textarea } from "./textarea";

const meta = {
  title: "UI/Field",
  component: FieldSet,
  tags: ["autodocs"],
} satisfies Meta<typeof FieldSet>;

export default meta;

type Story = StoryObj<typeof meta>;

const combineClassNames = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

export const ProfileFields: Story = {
  render: (args) => (
    <FieldSet
      {...args}
      className={combineClassNames(
        "w-full max-w-3xl space-y-6 rounded-xl border bg-card p-6 shadow-sm",
        args.className,
      )}
    >
      <FieldLegend>プロフィール</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="display-name">表示名</FieldLabel>
          <FieldContent>
            <Input id="display-name" placeholder="もち" />
            <FieldDescription>
              公開プロフィールに表示されます。
            </FieldDescription>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="user-handle">@ユーザー名</FieldLabel>
          <FieldContent>
            <Input
              id="user-handle"
              placeholder="mochi"
              autoComplete="username"
              aria-invalid
            />
            <FieldDescription>
              半角英数字とアンダースコアのみ使用できます。
            </FieldDescription>
            <FieldError
              errors={[{ message: "このユーザー名は既に使われています" }]}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="bio">自己紹介</FieldLabel>
          <FieldContent>
            <Textarea
              id="bio"
              placeholder="好きなことや最近の活動を書いてみましょう"
              rows={4}
            />
            <FieldDescription>Markdown 記法を利用できます。</FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
      <FieldSeparator>リンク</FieldSeparator>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="website">ウェブサイト</FieldLabel>
          <FieldContent>
            <Input id="website" placeholder="https://example.com" type="url" />
            <FieldDescription>任意で 1 件まで追加できます。</FieldDescription>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="location">場所</FieldLabel>
          <FieldContent>
            <Input id="location" placeholder="Tokyo, Japan" />
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

export const NotificationFields: Story = {
  render: (args) => (
    <FieldSet
      {...args}
      className={combineClassNames(
        "w-full max-w-2xl space-y-5 rounded-xl border bg-card p-6 shadow-sm",
        args.className,
      )}
    >
      <FieldLegend>通知設定</FieldLegend>
      <FieldGroup>
        <Field orientation="horizontal">
          <FieldLabel htmlFor="notify-mentions">メンション通知</FieldLabel>
          <FieldContent>
            <Switch id="notify-mentions" defaultChecked />
            <FieldDescription>
              アプリとメールの両方で通知します。
            </FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <FieldLabel htmlFor="notify-reposts">ブースト通知</FieldLabel>
          <FieldContent>
            <Switch id="notify-reposts" />
            <FieldDescription>
              人気投稿のみ通知するにはサーバー管理者にお問い合わせください。
            </FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <FieldLabel htmlFor="notify-digest">ダイジェストメール</FieldLabel>
          <FieldContent>
            <Switch id="notify-digest" defaultChecked />
            <FieldDescription>
              週 1 回、注目のノートをまとめて送ります。
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

export const ResponsiveField: Story = {
  render: (args) => (
    <FieldSet
      {...args}
      className={combineClassNames(
        "w-full max-w-3xl space-y-5 rounded-xl border bg-card p-6 shadow-sm",
        args.className,
      )}
    >
      <FieldLegend>高度な設定</FieldLegend>
      <FieldGroup>
        <Field orientation="responsive">
          <FieldLabel htmlFor="api-token" className="sr-only">
            API トークン
          </FieldLabel>
          <FieldContent>
            <FieldTitle>API トークン</FieldTitle>
            <FieldDescription>
              CLI
              や外部ツールからアクセスするときに必要です。コピー後は安全な場所に保管してください。
            </FieldDescription>
            <div className="flex @md/field-group:flex-row flex-col gap-2">
              <Input id="api-token" readOnly value="sk_live_xxxxxxxxxxxx" />
              <Button variant="outline">コピー</Button>
            </div>
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};
