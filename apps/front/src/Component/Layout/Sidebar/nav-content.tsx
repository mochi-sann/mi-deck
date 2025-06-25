import { useStorage } from "@/lib/storage/context";
import { Home, Plus, Server, Settings } from "lucide-react";
import { Fragment, useState } from "react";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";
import { NewServerForm } from "../../../routes/_authed/add-server/-form/NewServerForm";

export function NavContent() {
  const storage = useStorage();
  const [isAddServerDialogOpen, setIsAddServerDialogOpen] = useState(false);

  return (
    <Fragment>
      <SidebarGroup>
        <SidebarGroupLabel>¿¿</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/">
                <Home />
                <span>¿¿¿</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/settings">
                <Settings />
                <span>¿¿</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>
          <div className="flex items-center justify-between w-full">
            <span>µüÐü</span>
            <Dialog open={isAddServerDialogOpen} onOpenChange={setIsAddServerDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>°WDµüÐü’ý </DialogTitle>
                </DialogHeader>
                <NewServerForm 
                  onSuccess={() => setIsAddServerDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </SidebarGroupLabel>
        <SidebarMenu>
          {storage.servers.length === 0 ? (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <Server />
                <span className="text-muted-foreground">µüÐüLBŠ~[“</span>
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
