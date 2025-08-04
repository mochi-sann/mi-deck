import { useTranslation } from "react-i18next";
import Text from "@/components/ui/text";

export function ProcessingState() {
  const { t } = useTranslation("auth");

  return (
    <div className="w-full">
      <Text className="text-lg">{t("callback.processing")}</Text>
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-blue-600 border-b-2" />
    </div>
  );
}
