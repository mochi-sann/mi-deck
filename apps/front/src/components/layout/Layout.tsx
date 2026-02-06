import type React from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON, useSidebar } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state } = useSidebar();

  const sidebarValue =
    state === "collapsed" ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH;

  const rootStyle = {
    "--sidebar-w": sidebarValue,
  } as React.CSSProperties;

  return (
    <div className={"m-0 flex h-full w-full p-0"} style={rootStyle}>
      <AppSidebar />
      <ScrollArea
        className="m-0 h-full min-w-0 flex-1 p-0"
        viewportClassName="flex h-full w-[calc(100vw-var(--sidebar-w))] transition-[width] duration-200 ease-in-out"
      >
        {children}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
