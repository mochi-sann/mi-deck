import { Link } from "@tanstack/react-router";
import { Home, Plus, Server, Settings } from "lucide-react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStorage } from "@/lib/storage/context";
import { NewServerForm } from "@/routes/_authed/add-server/-form/NewServerForm";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";

export function NavContent() {
  const { t } = useTranslation();
  const storage = useStorage();
  const [isAddServerDialogOpen, setIsAddServerDialogOpen] = useState(false);

  return (
    <Fragment>
      <SidebarGroup>
        <SidebarGroupLabel>{t("navigation.title")}</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <Home />
                <span>{t("navigation.home")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/settings">
                <Settings />
                <span>{t("navigation.settings")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>
          <div className="flex w-full items-center justify-between">
            <span>{t("navigation.server")}</span>
            <Dialog
              open={isAddServerDialogOpen}
              onOpenChange={setIsAddServerDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("navigation.addNewServer")}</DialogTitle>
                </DialogHeader>
                <NewServerForm />
              </DialogContent>
            </Dialog>
          </div>
        </SidebarGroupLabel>
        <SidebarMenu>
          {storage.servers.length === 0 ? (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <Server />
                <span className="text-muted-foreground">
                  {t("navigation.noServers")}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            storage.servers.map((server) => (
              <SidebarMenuItem key={server.id}>
                <SidebarMenuButton
                  isActive={server.id === storage.currentServerId}
                  onClick={() => storage.setCurrentServer(server.id)}
                >
                  {server.serverInfo?.iconUrl ? (
                    <img
                      src={server.serverInfo.iconUrl}
                      className="h-4 w-4 rounded"
                      alt={server.serverInfo.name || server.origin}
                    />
                  ) : (
                    <Server className="h-4 w-4" />
                  )}
                  <span>{server.serverInfo?.name || server.origin}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroup>
    </Fragment>
  );
}
