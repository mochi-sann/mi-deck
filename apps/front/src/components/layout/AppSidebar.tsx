import { Pen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NewNote } from "@/features/notes";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";
import { NavContent } from "./Sidebar/nav-content";

export const AppSidebarPresenter = () => {
  const { t } = useTranslation("common");
  const { state } = useSidebar(); // useSidebarからstateを取得

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <NavContent />
      </SidebarContent>
      <SidebarFooter>
        <SidebarTrigger />
        <NewNote
          trigger={
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  <Pen />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-lg leading-tight">
                <span className="truncate font-medium">
                  {t("sidebar.note")}
                </span>
              </div>
            </SidebarMenuButton>
          }
        />
        {/* NavUser removed - no longer requires server-based authentication */}
      </SidebarFooter>
    </Sidebar>
  );
};

export const AppSidebar = () => {
  // No server-based authentication required - client-side only
  return <AppSidebarPresenter />;
};
