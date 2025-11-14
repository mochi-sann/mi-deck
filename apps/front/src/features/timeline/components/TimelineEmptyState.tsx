import { NotebookPen, Rocket, Server } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { AddSiberDialog } from "@/features/server-management/components/addSiberDialog";

type TimelineEmptyStateProps = {
  onCreateTimeline: () => void;
  canCreateTimeline: boolean;
};

export function TimelineEmptyState({
  onCreateTimeline,
  canCreateTimeline,
}: TimelineEmptyStateProps) {
  const { t } = useTranslation("timeline");
  const { t: Tn } = useTranslation();

  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <Empty className="min-h-[360px] w-full max-w-2xl border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-muted text-muted-foreground">
            <NotebookPen className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t("list.emptyTitle")}</EmptyTitle>
          <EmptyDescription>
            <Trans t={t} i18nKey="list.emptyDescription" />
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onCreateTimeline} disabled={!canCreateTimeline}>
            <Rocket className="mr-2 size-4" />
            {t("list.emptyPrimaryAction")}
          </Button>
          <AddSiberDialog>
            <Button>
              <Server />
              {Tn("navigation.addNewServer")}
            </Button>
          </AddSiberDialog>
        </EmptyContent>
      </Empty>
    </div>
  );
}
