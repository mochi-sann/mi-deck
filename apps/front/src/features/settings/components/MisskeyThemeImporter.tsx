import { type ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/lib/theme/context";

const getErrorMessageKey = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return "unknown";
  }

  switch (error.message) {
    case "INVALID_JSON":
      return "invalidJson";
    case "INVALID_DATA":
      return "invalidData";
    case "INVALID_BASE":
      return "invalidBase";
    case "INVALID_PROPS":
      return "invalidProps";
    case "EMPTY_PROPS":
      return "emptyProps";
    default:
      return "unknown";
  }
};

export function MisskeyThemeImporter() {
  const { t } = useTranslation("settings");
  const { toast } = useToast();
  const { importMisskeyTheme, clearCustomTheme, customTheme } = useTheme();
  const [jsonInput, setJsonInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const handleImport = async (sourceJson?: string) => {
    const payload = sourceJson ?? jsonInput;
    if (!payload.trim()) {
      setErrorKey("required");
      return;
    }

    setIsProcessing(true);
    setErrorKey(null);
    try {
      const theme = await importMisskeyTheme(payload);
      setJsonInput("");
      toast({
        title: t("theme.import.successTitle"),
        description: t("theme.import.successDescription", { name: theme.name }),
      });
    } catch (error) {
      const key = getErrorMessageKey(error);
      setErrorKey(key);
      if (key === "unknown") {
        toast({
          title: t("theme.import.errorTitle"),
          description: t("theme.import.errors.unknown"),
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await handleImport(text);
    } catch (error) {
      const key = getErrorMessageKey(error);
      setErrorKey(key);
      toast({
        title: t("theme.import.errorTitle"),
        description:
          key === "unknown"
            ? t("theme.import.errors.unknown")
            : t(`theme.import.errors.${key}`),
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleClear = async () => {
    setIsProcessing(true);
    setErrorKey(null);
    try {
      await clearCustomTheme();
      toast({
        title: t("theme.import.clearTitle"),
        description: t("theme.import.clearDescription"),
      });
    } catch (error) {
      const key = getErrorMessageKey(error);
      setErrorKey(key);
      toast({
        title: t("theme.import.errorTitle"),
        description:
          key === "unknown"
            ? t("theme.import.errors.unknown")
            : t(`theme.import.errors.${key}`),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{t("theme.import.title")}</Label>
        <p className="text-muted-foreground text-sm">
          {t("theme.import.description")}
        </p>
      </div>
      <div className="space-y-2">
        <Input
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          disabled={isProcessing}
          aria-label={t("theme.import.upload")}
        />
        <Textarea
          value={jsonInput}
          onChange={(event) => {
            setJsonInput(event.target.value);
            setErrorKey(null);
          }}
          placeholder={t("theme.import.placeholder") ?? undefined}
          className="min-h-32"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => void handleImport()}
            disabled={isProcessing || jsonInput.trim().length === 0}
          >
            {isProcessing
              ? t("theme.import.processing")
              : t("theme.import.button")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleClear()}
            disabled={isProcessing || !customTheme}
          >
            {t("theme.import.clearButton")}
          </Button>
        </div>
        {customTheme ? (
          <p className="text-muted-foreground text-xs">
            {t("theme.import.current", {
              name: customTheme.name,
              base: t(`theme.import.base.${customTheme.base}`),
            })}
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">
            {t("theme.import.noTheme")}
          </p>
        )}
        {errorKey ? (
          <p className="text-destructive text-sm">
            {t(`theme.import.errors.${errorKey}`)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
