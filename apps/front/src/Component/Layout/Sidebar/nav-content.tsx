import { useStorage } from "@/lib/storage/context";
import { NewServerForm } from "@/routes/_authed/add-server/-form/NewServerForm";
import { Home, Plus, Server, Settings } from "lucide-react";
import { Fragment, useState } from "react";
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
  const storage = useStorage();
  const [isAddServerDialogOpen, setIsAddServerDialogOpen] = useState(false);

  return (
    <Fragment>
      <SidebarGroup>
        <SidebarGroupLabel>ナビゲーション</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/">
                <Home />
                <span>ホーム</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/settings">
                <Settings />
                <span>設定</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>
          <div className="flex w-full items-center justify-between">
            <span>サーバー</span>
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
                  <DialogTitle>新しいサーバーを追加</DialogTitle>
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
                  サーバーがありません
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
