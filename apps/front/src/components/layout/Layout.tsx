import type React from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON, useSidebar } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  const { state, isMobile } = useSidebar();
  const sidebarWidth = isMobile
    ? null
    : state === "collapsed"
      ? SIDEBAR_WIDTH_ICON
      : SIDEBAR_WIDTH;
  const scrollAreaStyle = sidebarWidth
    ? ({
        width: `calc(100% - ${sidebarWidth})`,
      } as React.CSSProperties)
    : undefined;

  // const [value, setValue, removeValue] = useLocalStorage("isSidebarOpen", true);
  return (
    <div className="m-0 flex h-full w-full p-0">
      <AppSidebar />
      <ScrollArea
        className="m-0 h-full min-w-0 flex-1 p-0"
        viewportClassName="flex h-full w-full"
        style={scrollAreaStyle}
      >
        {props.children}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
