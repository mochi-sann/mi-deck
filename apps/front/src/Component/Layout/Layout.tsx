import type React from "react";
import { container } from "styled-system/patterns";

export type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  return (
    <div
      className={container({
        maxW: "5xl",
      })}
    >
      {props.children}
    </div>
  );
};
