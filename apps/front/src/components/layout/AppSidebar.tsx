import { Pen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NewNote } from "@/features/notes";
import { cn } from "@/lib/utils";
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
    <Sidebar collapsible="icon" side="left">
      <SidebarTrigger
        className={cn(
          "-translate-y-1/2 absolute top-[calc(var(--sidebar-width-icon)-1.5rem)] z-50 transition-all duration-200 ease-linear",
          state === "expanded"
            ? "left-[calc(var(--sidebar-width)-2.5rem)]"
            : "left-[calc(var(--sidebar-width-icon)-2.5rem)]",
        )}
      />
      <div className="h-12" />
      <SidebarContent>
        <NavContent />
      </SidebarContent>
      <SidebarFooter>
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
