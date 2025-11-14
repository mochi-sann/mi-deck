import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function NotFoundPage() {
  const { t } = useTranslation("common");

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-12">
      <Empty className="w-full max-w-2xl bg-card">
        <EmptyHeader>
          <span className="font-semibold text-muted-foreground text-sm tracking-[0.3em]">
            {t("notFound.code")}
          </span>
          <EmptyMedia variant="icon" className="bg-muted text-muted-foreground">
            <Compass className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t("notFound.title")}</EmptyTitle>
          <EmptyDescription>{t("notFound.description")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>
            <Link to="/">{t("notFound.primaryAction")}</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
