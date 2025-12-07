import { createLazyFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ApplicationInfo,
  ApplicationSettings,
  DataManagement,
  ServerInfo,
  TimelineSettings,
} from "@/features/settings";

export const Route = createLazyFileRoute("/_authed/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation("settings");

  return (
    <div className="container mx-auto flex h-screen max-w-4xl flex-col p-6">
      <div className="mb-6 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="font-bold text-2xl">{t("title")}</h1>
        </div>
      </div>

      <ScrollArea className="flex-1 pb-12">
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
