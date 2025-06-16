import { MenuFieldSet } from "@/Component/forms/MenuFieldSet";
import { TextFieldSet } from "@/Component/forms/TextFieldSet";
import { Button } from "@/Component/ui/button";
import { MiAuthReq } from "@/lib/miAuth";
import type React from "react";
import { useForm } from "react-hook-form";
type NewServerFormType = {
  serverOrigin: string;
  serverType: string;
};

export const NewServerForm: React.FC = () => {
  const { handleSubmit, control } = useForm<NewServerFormType>();
  const onSubmit = async (data: NewServerFormType) => {
    console.log(...[data, "👀 [NewServerForm.tsx:14]: data"].reverse());
    const MisskeySessionToken = MiAuthReq(data.serverOrigin);
    console.log(
      ...[
        MisskeySessionToken,
        "👀 [NewServerForm.tsx:17]: MisskeySessionUrl",
      ].reverse(),
    );
  };
  return (
    <div>
      <form
        className={"flex flex-1 flex-col gap-4"}
        onSubmit={handleSubmit(onSubmit)}
      >
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
        <Button variant={"default"} buttonWidth={"full"} type="submit">
          サーバーを追加する
        </Button>
      </form>
    </div>
  );
};
