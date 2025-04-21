import { useUser } from "@/lib/configureAuth";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
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
    <Sidebar>
      <SidebarContent>
        <p className="font-medium text-muted-foreground text-sm">
          <span className="text-foreground">Playground</span>
        </p>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
