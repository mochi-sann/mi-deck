import { ApplicationInfo } from "@/Component/settings/ApplicationInfo";
import { ApplicationSettings } from "@/Component/settings/ApplicationSettings";
import { DataManagement } from "@/Component/settings/DataManagement";
import { ServerInfo } from "@/Component/settings/ServerInfo";
import { TimelineSettings } from "@/Component/settings/TimelineSettings";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

export const Route = createLazyFileRoute("/_authed/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="container mx-auto h-screen max-w-4xl space-y-6 overflow-y-scroll p-6">
      <div className="mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="font-bold text-2xl">設定</h1>
      </div>

      <ApplicationSettings />
      <TimelineSettings />
      <ServerInfo />
      <DataManagement />
      <ApplicationInfo />
    </div>
  );
}
