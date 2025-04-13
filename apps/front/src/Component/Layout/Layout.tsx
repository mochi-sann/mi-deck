import type React from "react";

export type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  return <div className={"m-auto max-w-[900px]"}>{props.children}</div>;
};
