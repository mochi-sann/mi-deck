import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MenuFieldSet } from "@/components/forms/MenuFieldSet";
import { TextFieldSet } from "@/components/forms/TextFieldSet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";

type NewServerFormType = {
  serverOrigin: string;
  serverType: string;
};

export const NewServerForm: React.FC = () => {
  const { t } = useTranslation("server");
  const { handleSubmit, control } = useForm<NewServerFormType>();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const onSubmit = async (data: NewServerFormType) => {
    if (data.serverType !== "Misskey") {
      setError(t("newServerForm.onlyMisskey"));
      return;
    }

    try {
      setIsLoading(true);
      setError(undefined);

      // Clean up server origin (remove https:// if present)
      const origin = data.serverOrigin.replace(/^https?:\/\//, "");

      await auth.initiateAuth(origin);
    } catch (err) {
      console.log(...[err, "👀 [NewServerForm.tsx:34]: err"].reverse());
      setError(
        err instanceof Error ? err.message : t("newServerForm.addFailed"),
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
          placeholder={t("newServerForm.placeholder")}
          label={t("newServerForm.serverUrl")}
          type="text"
          control={control}
          name="serverOrigin"
          validation={t("newServerForm.validation.serverOriginRequired")}
          rules={{
            required: t("newServerForm.validation.serverOriginRequired"),
          }}
        />
        <MenuFieldSet
          name="serverType"
          collection={[
            { label: "Misskey", value: "Misskey" },
            { label: "Mastodon", value: "Mastodon" },
          ]}
          label={t("newServerForm.serverType")}
          control={control}
          validation={t("newServerForm.validation.serverTypeRequired")}
          rules={{
            required: t("newServerForm.validation.serverTypeRequired"),
          }}
          placeholder={t("newServerForm.selectPlaceholder")}
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
          {t("newServerForm.addButton")}
        </Button>
      </form>
    </div>
  );
};
