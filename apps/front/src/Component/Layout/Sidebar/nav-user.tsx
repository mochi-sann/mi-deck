import { LogOut, Settings, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/Component/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Component/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/Component/ui/sidebar";
import { useLogout, useUser } from "@/lib/configureAuth";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { status, data: user } = useUser();
  const { mutateAsync: LgoutMuteteAsync } = useLogout();
  if (status === "pending" || user === undefined || user === null) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground "
            >
              <Avatar className="h-8 w-8 rounded-lg ">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />

                <AvatarFallback className="rounded-lg">
                  <UserRound />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-lg leading-tight">
                <span className="truncate font-medium">{user.name}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem>
              <Settings size={28} strokeWidth={3} absoluteStrokeWidth />
              設定
            </DropdownMenuItem>
            <DropdownMenuItem onClick={LgoutMuteteAsync}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
