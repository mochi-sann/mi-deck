import { useUser } from "@/lib/configureAuth";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
    <Sidebar collapsible="icon"> {/* Add collapsible="icon" prop */}
      <SidebarContent>
        <p className="font-medium text-muted-foreground text-sm">
          <span className="text-foreground">Playground</span>
        </p>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        {/* Add the SidebarTrigger */}
        <SidebarTrigger className="mt-auto" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
