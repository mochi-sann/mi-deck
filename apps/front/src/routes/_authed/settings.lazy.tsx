import { createLazyFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/Component/ui/scroll-area";
import { ApplicationInfo } from "@/features/settings/components/ApplicationInfo";
import { ApplicationSettings } from "@/features/settings/components/ApplicationSettings";
import { DataManagement } from "@/features/settings/components/DataManagement";
import { ServerInfo } from "@/features/settings/components/ServerInfo";
import { TimelineSettings } from "@/features/settings/components/TimelineSettings";

export const Route = createLazyFileRoute("/_authed/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation("settings");

  return (
    <div className="container mx-auto flex h-screen max-w-4xl flex-col p-6">
      <div className="mb-6 flex flex-shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="font-bold text-2xl">{t("title")}</h1>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 pr-4">
          <ApplicationSettings />
          <TimelineSettings />
          <ServerInfo />
          <DataManagement />
          <ApplicationInfo />
        </div>
      </ScrollArea>
    </div>
  );
}
