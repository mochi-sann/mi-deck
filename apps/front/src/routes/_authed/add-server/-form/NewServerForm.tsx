import { MenuFieldSet } from "@/Component/forms/MenuFieldSet";
import { TextFieldSet } from "@/Component/forms/TextFieldSet";
import { FormStyle } from "@/Component/forms/formStyle";
import { Button } from "@/Component/ui/button";
import type React from "react";
import { useForm } from "react-hook-form";
type NewServerFormType = {
  serverOrigin: string;
  serverType: string;
};
export const NewServerForm: React.FC = () => {
  const { handleSubmit, control, formState } = useForm<NewServerFormType>();
  const onSubmit = async (data: NewServerFormType) => {
    console.log(...[data, "👀 [NewServerForm.tsx:14]: data"].reverse());
  };
  return (
    <div>
      <form className={FormStyle} onSubmit={handleSubmit(onSubmit)}>
        <TextFieldSet
          placeholder="例: misskey.io"
          label="サーバーのURL"
          type="text"
          control={control}
          name="serverOrigin"
          validation="Please enter a valid serverOrigin address"
          rules={{
            required: "Please enter a valid serverOrigin address",
          }}
        />
        <MenuFieldSet
          name="serverType"
          collection={[
            { label: "Misskey", value: "Misskey" },
            { label: "Mastodon", value: "Mastodon" },
          ]}
          label="サーバータイプ"
          control={control}
          validation="Please select a serverType"
          rules={{
            required: "Please select a serverType",
          }}
          placeholder="サーバーを選んでください"
        />
        <Button variant={"solid"} buttonWidth={"full"} type="submit">
          サーバーを追加する
        </Button>
        {JSON.stringify(formState.errors)}
      </form>
    </div>
  );
};
