import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStorage } from "@/lib/storage/context";
import { useTranslation } from "react-i18next";

export function ServerInfo() {
  const storage = useStorage();
  const { t } = useTranslation("settings");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("server.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {storage.servers.length === 0 ? (
          <p className="text-muted-foreground">{t("server.noServers")}</p>
        ) : (
          <div className="space-y-4">
            {storage.servers.map((server) => (
              <div
                key={server.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  {server.serverInfo?.iconUrl && (
                    <img
                      src={server.serverInfo.iconUrl}
                      className="h-8 w-8 rounded"
                      alt={server.serverInfo.name || server.origin}
                    />
                  )}
                  <div>
                    <p className="font-medium">
                      {server.serverInfo?.name || server.origin}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {server.origin}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {server.id === storage.currentServerId && (
                    <span className="rounded bg-primary px-2 py-1 text-primary-foreground text-xs">
                      {t("server.currentServer")}
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => storage.deleteServer(server.id)}
                  >
                    {t("server.delete")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
