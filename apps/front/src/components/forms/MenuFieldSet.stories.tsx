import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { MenuFieldSet } from "./MenuFieldSet";

type MenuFieldSetProps = {
  name: string;
  label: string;
  placeholder: string;
  validation: string;
  collection: Array<{
    label: string;
    value: string;
    disabled?: boolean;
  }>;
};

const meta = {
  title: "Forms/MenuFieldSet",
  component: MenuFieldSet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MenuFieldSet>;

export default meta;
type Story = StoryObj<typeof meta>;

const FormWrapper = (args: MenuFieldSetProps) => {
  const { control } = useForm();
  return <MenuFieldSet {...args} control={control} />;
};

export const Default: Story = {
  args: {
    name: "menu",
    label: "メニュー選択",
    placeholder: "選択してください",
    validation: "required",
    collection: [
      { label: "オプション1", value: "option1" },
      { label: "オプション2", value: "option2" },
      { label: "オプション3", value: "option3" },
    ],
  },
  render: (args) => <FormWrapper {...args} />,
};

export const WithDisabledOption: Story = {
  args: {
    name: "menu",
    label: "メニュー選択（無効オプションあり）",
    placeholder: "選択してください",
    validation: "required",
    collection: [
      { label: "オプション1", value: "option1" },
      { label: "オプション2", value: "option2", disabled: true },
      { label: "オプション3", value: "option3" },
    ],
  },
  render: (args) => <FormWrapper {...args} />,
};
