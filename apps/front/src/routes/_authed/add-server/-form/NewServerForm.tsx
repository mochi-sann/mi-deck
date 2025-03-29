import type React from "react";
import { useForm } from "react-hook-form";
import { MenuFieldSet } from "../../../../Component/forms/MenuFieldSet";
import { TextFieldSet } from "../../../../Component/forms/TextFieldSet";
import { FormStyle } from "../../../../Component/forms/formStyle";
import { Button } from "../../../../Component/ui/button";
import { useServerSessions } from "../../../../hooks/useServerSessions";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

type NewServerFormType = {
  origin: string;
  serverType: "Misskey" | "OtherServer";
};

export const NewServerForm: React.FC = () => {
  const navigate = useNavigate();
  const { createSession, isLoading } = useServerSessions();
  const { handleSubmit, control, formState } = useForm<NewServerFormType>();

  const onSubmit = async (data: NewServerFormType) => {
    try {
      await createSession({
        origin: data.origin,
        serverType: data.serverType,
      });
      toast.success("サーバーが追加されました");
      navigate({ to: "/_authed/dashboard" });
    } catch (error) {
      toast.error("サーバーの追加に失敗しました");
      console.error("Failed to add server:", error);
    }
  };
  return (
    <div>
      <form className={FormStyle} onSubmit={handleSubmit(onSubmit)}>
        <TextFieldSet
          placeholder="例: misskey.io"
          label="サーバーのURL"
          type="text"
          control={control}
          name="origin"
          validation="サーバーのURLを入力してください"
          rules={{
            required: "サーバーのURLは必須です",
            pattern: {
              value: /^https?:\/\/.+/,
              message: "有効なURLを入力してください",
            },
          }}
        />
        <MenuFieldSet
          name="serverType"
          collection={[
            { label: "Misskey", value: "Misskey" },
            { label: "その他", value: "OtherServer" },
          ]}
          label="サーバータイプ"
          control={control}
          validation="サーバータイプを選択してください"
          rules={{
            required: "サーバータイプは必須です",
          }}
          placeholder="サーバータイプを選択"
        />
        <Button 
          variant={"solid"} 
          buttonWidth={"full"} 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "追加中..." : "サーバーを追加する"}
        </Button>
        {JSON.stringify(formState.errors)}
      </form>
    </div>
  );
};
