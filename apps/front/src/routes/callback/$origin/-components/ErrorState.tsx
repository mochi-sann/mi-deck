import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Text from "@/components/ui/text";

export interface ErrorStateProps {
  error?: string;
  onRetry: () => void;
  onGoHome: () => void;
}

export function ErrorState({ error, onRetry, onGoHome }: ErrorStateProps) {
  const { t } = useTranslation("auth");

  return (
    <>
      <Text className="text-lg text-red-600">{t("callback.error.title")}</Text>
      {error && (
        <Text className="rounded bg-red-50 p-3 text-gray-600 text-sm">
          {error}
        </Text>
      )}
      <div className="flex justify-center space-x-4">
        <Button onClick={onRetry} variant="outline">
          {t("callback.actions.retry")}
        </Button>
        <Button onClick={onGoHome}>{t("callback.actions.goHome")}</Button>
      </div>
    </>
  );
}
