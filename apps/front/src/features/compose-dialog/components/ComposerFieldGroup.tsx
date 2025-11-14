import type { ReactNode } from "react";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import Text from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface ComposerFieldGroupProps {
  label: ReactNode;
  labelFor?: string;
  description?: ReactNode;
  descriptionId?: string;
  status?: ReactNode;
  statusId?: string;
  statusClassName?: string;
  error?: ReactNode;
  errorId?: string;
  actions?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function ComposerFieldGroup({
  label,
  labelFor,
  description,
  descriptionId,
  status,
  statusId,
  statusClassName,
  error,
  errorId,
  actions,
  children,
  disabled,
  className,
}: ComposerFieldGroupProps) {
  return (
    <InputGroup
      data-disabled={disabled}
      className={cn("flex-col items-stretch", className)}
    >
      <InputGroupAddon
        align="block-start"
        className="w-full flex-col items-start gap-2"
      >
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Label htmlFor={labelFor} className="font-medium text-sm">
            {label}
          </Label>
          {actions ? (
            <div className="flex items-center gap-1">{actions}</div>
          ) : null}
        </div>
        {description ? (
          <Text
            affects="muted"
            id={descriptionId}
            className="text-muted-foreground text-xs"
          >
            {description}
          </Text>
        ) : null}
      </InputGroupAddon>

      <div className="flex w-full flex-col gap-2 px-3 py-2">{children}</div>

      {(status || error) && (
        <InputGroupAddon
          align="block-end"
          className="w-full flex-col items-start gap-1 border-t"
        >
          {status ? (
            <div
              id={statusId}
              className={cn("text-muted-foreground text-xs", statusClassName)}
            >
              {status}
            </div>
          ) : null}
          {error ? (
            <Text affects="small" id={errorId} className="text-destructive">
              {error}
            </Text>
          ) : null}
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
