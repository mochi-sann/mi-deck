import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStorage } from "@/lib/storage/context";

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
        <div>
          <Button variant="outline" className="mt-4 w-full sm:w-auto">
            <Link to="/licenses">{t("viewLicenses")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
