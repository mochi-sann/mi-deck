declare module "@radix-ui/react-hover-card" {
  import * as React from "react";
  type GenericProps = Record<string, unknown>;
  type ForwardRefComponent = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<GenericProps> & React.RefAttributes<HTMLElement>
  >;

  export const Root: React.FC<GenericProps>;
  export const Trigger: ForwardRefComponent;
  export const Content: ForwardRefComponent;
  export const Portal: React.FC<GenericProps>;
}
