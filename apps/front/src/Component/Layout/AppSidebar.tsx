import { useUser } from "@/lib/configureAuth";
import type { UserType } from "@/lib/configureAuth";
import { cn } from "@/lib/utils"; // cnをインポート
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
  useSidebar, // useSidebarをインポート
} from "../ui/sidebar";
import { NavUser } from "./Sidebar/nav-user";

type AppSidebarPresenterProps = {
  user: UserType;
};

export const AppSidebarPresenter = ({ user }: AppSidebarPresenterProps) => {
  const { state } = useSidebar(); // useSidebarからstateを取得

  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarTrigger
        className={cn(
          "-translate-y-1/2 absolute top-1/2 z-50 mt-auto transition-all duration-200 ease-linear",
          state === "expanded"
            ? "left-[calc(var(--sidebar-width)-1.5rem)]"
            : "left-[calc(var(--sidebar-width-icon)-0.5rem)]",
        )}
      />
      <SidebarContent />
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
        <NavUser user={user} />
        <SidebarRail />
      </SidebarFooter>
    </Sidebar>
  );
};

export const AppSidebar = () => {
  const { status, data: userData } = useUser();

  if (status === "pending" || !userData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <AppSidebarPresenter user={userData} />;
};
