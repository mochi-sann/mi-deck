import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useStorage } from "@/lib/storage/context";

interface AddServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddServerDialog({ open, onOpenChange }: AddServerDialogProps) {
  const [serverUrl, setServerUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation("settings");
  const { toast } = useToast();
  const storage = useStorage();

  const validateServerUrl = (url: string): string | null => {
    if (!url.trim()) {
      return t("server.add.errors.urlRequired");
    }

    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        return t("server.add.errors.invalidProtocol");
      }
      return null;
    } catch {
      return t("server.add.errors.invalidUrl");
    }
  };

  const normalizeUrl = (url: string): string => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  };

  const fetchServerInfo = async (origin: string) => {
    try {
      const response = await fetch(`${origin}/api/meta`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const meta = await response.json();

      return {
        name: meta.name || origin,
        version: meta.version || "unknown",
        description: meta.description,
        iconUrl: meta.iconUrl,
      };
    } catch (error) {
      console.warn("Failed to fetch server info:", error);
      return {
        name: origin,
        version: "unknown",
        description: undefined,
        iconUrl: undefined,
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateServerUrl(serverUrl);
    if (validationError) {
      toast({
        title: t("server.add.errors.title"),
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const normalizedUrl = normalizeUrl(serverUrl.trim());
      const origin = new URL(normalizedUrl).origin;

      // Check if server already exists
      const existingServer = storage.servers.find((s) => s.origin === origin);
      if (existingServer) {
        toast({
          title: t("server.add.errors.title"),
          description: t("server.add.errors.serverExists"),
          variant: "destructive",
        });
        return;
      }

      // Fetch server information
      const serverInfo = await fetchServerInfo(origin);

      // Add server to storage
      await storage.addServer({
        origin,
        isActive: true,
        serverInfo,
      });

      toast({
        title: t("server.add.success.title"),
        description: t("server.add.success.description", {
          serverName: serverInfo.name,
        }),
      });

      // Reset form and close dialog
      setServerUrl("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add server:", error);
      toast({
        title: t("server.add.errors.title"),
        description: t("server.add.errors.connectionFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setServerUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("server.add.title")}</DialogTitle>
          <DialogDescription>{t("server.add.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serverUrl" className="text-right">
                {t("server.add.urlLabel")}
              </Label>
              <Input
                id="serverUrl"
                type="text"
                placeholder="misskey.io"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="col-span-3"
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("server.add.adding") : t("server.add.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
