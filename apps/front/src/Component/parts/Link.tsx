import { Link, LinkComponent } from "@tanstack/react-router";
import type React from "react";

export type LinkProps = LinkComponent<"a">;

export const StyledLink: React.FC<LinkProps> = (props) => {
  return <Link {...props} />;
};
