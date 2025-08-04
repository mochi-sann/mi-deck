import { useTranslation } from "react-i18next";
import Text from "@/components/ui/text";

export interface SuccessStateProps {
  serverName: string;
}

export function SuccessState({ serverName }: SuccessStateProps) {
  const { t } = useTranslation("auth");

  return (
    <div className="flex flex-col items-center space-y-2">
      <Text className="text-green-600 text-lg">
        {t("callback.success.title")}
      </Text>
      <Text className="text-gray-600 text-sm">
        {t("callback.success.serverAdded", {
          serverName: decodeURIComponent(serverName),
        })}
        <br />
        {t("callback.success.redirecting")}
      </Text>
    </div>
  );
}
