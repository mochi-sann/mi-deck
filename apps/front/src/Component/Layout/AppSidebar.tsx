import { useUser } from "@/lib/configureAuth";
import { Pen } from "lucide-react";
import { NewNote } from "../logics/NewNote";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
} from "../ui/sidebar";
import { NavUser } from "./Sidebar/nav-user";

export const AppSidebar = () => {
  const { status, data: userData } = useUser();

  if (status === "pending" || userData === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    // SidebarProvider should wrap Sidebar if not already done in a parent component
    // Assuming SidebarProvider is wrapping this component elsewhere based on sidebar.tsx structure
    <Sidebar collapsible="icon" side="left">
      <SidebarContent>
        <p className="font-medium text-muted-foreground text-sm">
          <span className="text-foreground">Playground</span>
        </p>
      </SidebarContent>
      <SidebarFooter>
        <Dialog>
          <DialogTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground "
            >
              <Avatar className="h-8 w-8 rounded-lg ">
                <AvatarFallback className="rounded-lg">
                  <Pen />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-lg leading-tight">
                <span className="truncate font-medium">ノート</span>
              </div>
            </SidebarMenuButton>
          </DialogTrigger>
          <DialogContent>
            <NewNote />
          </DialogContent>
        </Dialog>
        <NavUser />
        <SidebarTrigger className="mt-auto" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
