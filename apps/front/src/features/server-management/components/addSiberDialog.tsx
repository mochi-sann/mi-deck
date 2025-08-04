import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewServerForm } from "./NewServerForm";

export type AddSiberDialogProps = {
  children: React.ReactNode;
  onSuccess?: () => void;
};
export const AddSiberDialog = (props: AddSiberDialogProps) => {
  const [isAddServerDialogOpen, setIsAddServerDialogOpen] = useState(false);
  const { t } = useTranslation();

  const handleSuccess = () => {
    setIsAddServerDialogOpen(false);
    props.onSuccess?.();
  };

  return (
    <Dialog
      open={isAddServerDialogOpen}
      onOpenChange={setIsAddServerDialogOpen}
    >
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("navigation.addNewServer")}</DialogTitle>
        </DialogHeader>
        <NewServerForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};
