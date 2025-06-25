import { MenuFieldSet } from "@/Component/forms/MenuFieldSet";
import { TextFieldSet } from "@/Component/forms/TextFieldSet";
import { Button } from "@/Component/ui/button";
import { useAuth } from "@/lib/auth/context";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
type NewServerFormType = {
  serverOrigin: string;
  serverType: string;
};

export const NewServerForm: React.FC = () => {
  const { handleSubmit, control } = useForm<NewServerFormType>();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const onSubmit = async (data: NewServerFormType) => {
    if (data.serverType !== "Misskey") {
      setError("現在はMisskeyサーバーのみサポートしています");
      return;
    }

    try {
      setIsLoading(true);
      setError(undefined);

      // Clean up server origin (remove https:// if present)
      const origin = data.serverOrigin.replace(/^https?:\/\//, "");

      await auth.initiateAuth(origin);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "サーバー追加に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
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
        {error && (
          <div className="rounded bg-red-50 p-3 text-red-600 text-sm">
            {error}
          </div>
        )}
        <Button
          variant={"default"}
          buttonWidth={"full"}
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
        >
          サーバーを追加する
        </Button>
      </form>
    </div>
  );
};
