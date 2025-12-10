import { valibotResolver } from "@hookform/resolvers/valibot";
import { TFunction } from "i18next";
import type React from "react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as v from "valibot";
import { TextFieldSet } from "@/components/forms/TextFieldSet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    authMethod: v.optional(v.union([v.literal("miauth"), v.literal("token")])),
    accessToken: v.optional(v.string()),
  });
type NewServerFormType = {
  serverOrigin: string;
  serverType: string;
  authMethod?: "miauth" | "token";
  accessToken?: string;
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
      authMethod: "miauth",
      accessToken: "",
    },
  });
  const [method, setMethod] = useState<"miauth" | "token">("miauth");
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

      if (method === "token") {
        if (!data.accessToken) {
          setError(t("newServerForm.validation.accessTokenRequired"));
          return;
        }
        await auth.addServerWithToken(origin, data.accessToken);
        onSuccess?.();
      } else {
        await auth.initiateAuth(origin);
        onSuccess?.();
      }
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

        <div className="space-y-3">
          <Label>{t("newServerForm.authMethod")}</Label>
          <RadioGroup
            defaultValue="miauth"
            onValueChange={(v) => setMethod(v as "miauth" | "token")}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="miauth" id="miauth" />
              <Label htmlFor="miauth">{t("newServerForm.miAuth")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="token" id="token" />
              <Label htmlFor="token">{t("newServerForm.accessToken")}</Label>
            </div>
          </RadioGroup>
        </div>

        {method === "token" && (
          <TextFieldSet
            required
            placeholder={t("newServerForm.accessTokenPlaceholder")}
            label={t("newServerForm.accessToken")}
            type="password"
            control={control}
            name="accessToken"
            rules={{
              required:
                method === "token"
                  ? t("newServerForm.validation.accessTokenRequired")
                  : undefined,
            }}
          />
        )}
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
