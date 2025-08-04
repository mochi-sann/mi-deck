import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStorage } from "@/lib/storage/context";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import { AddServerDialog } from "./AddServerDialog";
import { DeleteServerConfirmDialog } from "./DeleteServerConfirmDialog";

export function ServerInfo() {
  const storage = useStorage();
  const { t } = useTranslation("settings");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serverToDelete, setServerToDelete] =
    useState<MisskeyServerConnection | null>(null);

  const handleDeleteClick = (server: MisskeyServerConnection) => {
    setServerToDelete(server);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (serverToDelete) {
      storage.deleteServer(serverToDelete.id);
      setServerToDelete(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("server.title")}</CardTitle>
          <Button
            onClick={() => setAddDialogOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("server.add.button")}
          </Button>
        </div>
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
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(server)}
                  >
                    {t("server.delete")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <AddServerDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
        <DeleteServerConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          server={serverToDelete}
          onConfirm={handleConfirmDelete}
        />
      </CardContent>
    </Card>
  );
}
