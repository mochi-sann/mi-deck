import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStorage } from "@/lib/storage/context";
import { useTranslation } from "react-i18next";

export function ApplicationInfo() {
  const { t } = useTranslation("settings");
  const storage = useStorage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("applicationInfo")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t("version")}:</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>{t("buildDate")}:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("connectedServers")}:</span>
            <span>{storage.servers.length}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("timelineCount")}:</span>
            <span>{storage.timelines.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
