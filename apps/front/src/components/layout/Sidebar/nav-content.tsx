import { Link } from "@tanstack/react-router";
import { Home, Plus, Server, Settings } from "lucide-react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { AddSiberDialog } from "@/features/server-management/components/addSiberDialog";
import { useStorage } from "@/lib/storage/context";
import { Button } from "../../ui/button";
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
            <AddSiberDialog>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </AddSiberDialog>
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
