import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { TextFieldSet } from "./TextFieldSet";

type TextFieldSetProps = {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  validation: string;
};

const meta = {
  title: "Forms/TextFieldSet",
  component: TextFieldSet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TextFieldSet>;

export default meta;
type Story = StoryObj<typeof meta>;

const FormWrapper = (args: TextFieldSetProps) => {
  const { control } = useForm();
  return <TextFieldSet {...args} control={control} />;
};

export const Text: Story = {
  args: {
    name: "text",
    label: "テキスト入力",
    type: "text",
    placeholder: "テキストを入力してください",
    validation: "必須項目です",
  },
  render: (args) => <FormWrapper {...args} />,
};

export const Email: Story = {
  args: {
    name: "email",
    label: "メールアドレス",
    type: "email",
    placeholder: "example@example.com",
    validation: "メールアドレスを入力してください",
  },
  render: (args) => <FormWrapper {...args} />,
};

export const Password: Story = {
  args: {
    name: "password",
    label: "パスワード",
    type: "password",
    placeholder: "パスワードを入力してください",
    validation: "8文字以上で入力してください",
  },
  render: (args) => <FormWrapper {...args} />,
};

export const NumberInput: Story = {
  args: {
    name: "number",
    label: "数値入力",
    type: "number",
    placeholder: "数値を入力してください",
    validation: "数値を入力してください",
  },
  render: (args) => <FormWrapper {...args} />,
};
