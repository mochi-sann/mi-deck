import { AlertTriangle } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MisskeyServerConnection } from "@/lib/storage/types";

export type DeleteServerConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server: MisskeyServerConnection | null;
  onConfirm: () => void;
};

export const DeleteServerConfirmDialog: React.FC<
  DeleteServerConfirmDialogProps
> = ({ open, onOpenChange, server, onConfirm }) => {
  const { t } = useTranslation("settings");

  if (!server) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const serverDisplayName = server.serverInfo?.name || server.origin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("server.deleteConfirm.title")}</DialogTitle>
          <DialogDescription>
            {t("server.deleteConfirm.message")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            {server.serverInfo?.iconUrl && (
              <img
                src={server.serverInfo.iconUrl}
                alt={serverDisplayName}
                className="h-8 w-8 rounded"
              />
            )}
            <div>
              <p className="font-medium">{serverDisplayName}</p>
              <p className="text-muted-foreground text-sm">{server.origin}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm">{t("server.deleteConfirm.warning")}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t("server.deleteConfirm.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {t("server.deleteConfirm.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
