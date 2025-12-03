import { EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

type NsfwBarrierProps = {
  onReveal: () => void;
};

export function NsfwBarrier({ onReveal }: NsfwBarrierProps) {
  const { t } = useTranslation("settings");

  return (
    <div className="flex w-full flex-col gap-2 rounded-md border border-muted bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <EyeOff className="h-4 w-4" />
        <span className="font-medium text-sm">{t("timeline.nsfw.title")}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onReveal}
        className="w-full sm:w-auto"
      >
        {t("timeline.nsfw.show")}
      </Button>
    </div>
  );
}
