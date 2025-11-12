import type React from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON, useSidebar } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state, isMobile } = useSidebar();

  // 使用する幅の値（import した定数）を決定
  const sidebarValue = isMobile
    ? 0
    : state === "collapsed"
      ? SIDEBAR_WIDTH_ICON
      : SIDEBAR_WIDTH;

  // CSS変数を inline style で設定（Tailwind はクラスだけ読めればOK）
  const rootStyle = {
    "--sidebar-w": sidebarValue,
  } as React.CSSProperties;

  return (
    <div className={"m-0 flex h-full w-full p-0"} style={rootStyle}>
      <AppSidebar />
      <ScrollArea
        className="m-0 h-full min-w-0 flex-1 p-0"
        // ← これは静的クラスなので Tailwind が確実に拾える
        viewportClassName="flex h-full w-[calc(100vw-var(--sidebar-w))] transition-[width] duration-200 ease-in-out"
      >
        {children}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
