import { valibotResolver } from "@hookform/resolvers/valibot";
import { TFunction } from "i18next";
import type React from "react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as v from "valibot";
import { TextFieldSet } from "@/components/forms/TextFieldSet";
import { Button } from "@/components/ui/button";
import { clientAuthManager } from "@/features/auth/api/clientAuth";
import { useAuth } from "@/features/auth/hooks/useAuth";

const NewServerFormSchema = (t: TFunction<"server", undefined>) =>
  v.object({
    serverOrigin: v.pipe(
      v.string(t("newServerForm.validation.serverOriginRequired")),
      v.minLength(1, t("newServerForm.validation.serverOriginRequired")),
    ),
    serverType: v.pipe(
      v.union(
        [v.literal("Misskey")],
        t("newServerForm.validation.serverTypeRequired"),
      ),
      v.nonEmpty(t("newServerForm.validation.serverTypeRequired")),
    ),
  });
type NewServerFormType = {
  serverOrigin: string;
  serverType: string;
};

export type NewServerFormProps = {
  onSuccess?: () => void;
};

export const NewServerForm: React.FC<NewServerFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation("server");
  const formSchema = useMemo(() => NewServerFormSchema(t), [t]);
  type FormValues = v.InferOutput<typeof formSchema>;

  const { handleSubmit, control } = useForm<FormValues>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      serverOrigin: "",
      serverType: "Misskey",
    },
  });
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

      // Clean up server origin using centralized method
      const origin = clientAuthManager.cleanOriginInput(data.serverOrigin);

      if (!origin) {
        setError(t("newServerForm.validation.invalidServerUrl"));
        return;
      }

      await auth.initiateAuth(origin);
      onSuccess?.();
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
          required
          placeholder={t("newServerForm.placeholder")}
          label={t("newServerForm.serverUrl")}
          type="text"
          control={control}
          name="serverOrigin"
          rules={{
            required: t("newServerForm.validation.serverOriginRequired"),
          }}
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
