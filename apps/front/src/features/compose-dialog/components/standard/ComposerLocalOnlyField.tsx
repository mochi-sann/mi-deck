import type { TFunction } from "i18next";
import type { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import type { NoteComposerFormValues } from "../../hooks/useNoteComposer";
import type { ComposerFieldIds } from "./types";

interface ComposerLocalOnlyFieldProps {
  form: UseFormReturn<NoteComposerFormValues>;
  fieldIds: ComposerFieldIds;
  disabled: boolean;
  t: TFunction<"notes">;
}

export function ComposerLocalOnlyField({
  form,
  fieldIds,
  disabled,
  t,
}: ComposerLocalOnlyFieldProps) {
  return (
    <FormField
      control={form.control}
      name="isLocalOnly"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center gap-2">
          <FormControl>
            <Checkbox
              id={fieldIds.localOnly.control}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <FormLabel
            htmlFor={fieldIds.localOnly.control}
            className="text-muted-foreground text-sm"
          >
            {t("compose.localOnlyDescription")}
          </FormLabel>
        </FormItem>
      )}
    />
  );
}
