import { Link, LinkOptions } from "@tanstack/react-router";
import type React from "react";

export type LinkProps = LinkOptions & React.ComponentPropsWithoutRef<"a">;

export const StyledLink: React.FC<LinkProps> = ({ children, ...props }) => {
  return <Link {...props}>{children}</Link>;
};
