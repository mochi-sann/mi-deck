import type { TFunction } from "i18next";
import { ImagePlus } from "lucide-react";
import { FileUpload } from "@/components/parts/FileUpload";
import { Badge } from "@/components/ui/badge";
import { FormControl } from "@/components/ui/form";
import { ComposerFieldGroup } from "../ComposerFieldGroup";
import type { ComposerFieldIds } from "./types";

interface ComposerAttachmentsFieldProps {
  t: TFunction<"notes">;
  files: File[];
  fileStatusText: string;
  description: string;
  fieldIds: ComposerFieldIds;
  disabled: boolean;
  onFilesChange: (files: File[]) => void;
  registerFileInput: (element: HTMLInputElement | null) => void;
}

export function ComposerAttachmentsField({
  t,
  files,
  fileStatusText,
  description,
  fieldIds,
  disabled,
  onFilesChange,
  registerFileInput,
}: ComposerAttachmentsFieldProps) {
  return (
    <ComposerFieldGroup
      label={t("compose.attachmentsLabel")}
      labelFor={fieldIds.attachments.control}
      description={description}
      descriptionId={fieldIds.attachments.description}
      status={
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <ImagePlus className="mr-1 size-3.5" />
            {files.length}
          </Badge>
          <span>{fileStatusText}</span>
        </div>
      }
      statusId={fieldIds.attachments.status}
      disabled={disabled}
    >
      <FormControl>
        <FileUpload
          files={files}
          onFilesChange={onFilesChange}
          hideLabel
          id={fieldIds.attachments.control}
          disabled={disabled}
          inputRef={registerFileInput}
          inputProps={{
            "aria-describedby":
              [fieldIds.attachments.description, fieldIds.attachments.status]
                .filter(Boolean)
                .join(" ") || undefined,
          }}
        />
      </FormControl>
    </ComposerFieldGroup>
  );
}
