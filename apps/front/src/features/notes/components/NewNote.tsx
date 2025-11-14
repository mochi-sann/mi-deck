import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { NoteComposerDialog } from "@/features/compose-dialog/components/NoteComposerDialog";

interface NewNoteProps {
  trigger?: ReactNode;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onOpenChange?: (open: boolean) => void;
}

export const NewNote = ({
  trigger,
  disabled,
  onSuccess,
  onError,
  onOpenChange,
}: NewNoteProps) => {
  const { t } = useTranslation("notes");

  const defaultTrigger = trigger ?? (
    <Button variant="default">{t("compose.trigger.create")}</Button>
  );

  return (
    <NoteComposerDialog
      mode="create"
      trigger={defaultTrigger}
      disabled={disabled}
      onSuccess={onSuccess}
      onError={onError}
      onOpenChange={onOpenChange}
    />
  );
};
