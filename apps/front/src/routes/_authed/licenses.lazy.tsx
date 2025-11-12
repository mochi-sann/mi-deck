import { createLazyFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import licensesData from "@/assets/licenses.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createLazyFileRoute("/_authed/licenses")({
  component: LicensesPage,
});

type RawLicenseEntry = {
  name: string;
  versions?: string[] | null;
  license: string;
  author?: string | null;
  homepage?: string | null;
  description?: string | null;
};

type LicensesByType = Record<string, RawLicenseEntry[]>;

function LicensesPage() {
  const { t } = useTranslation("licenses");

  const licenseGroups = useMemo(() => {
    const data = licensesData as LicensesByType;
    return Object.entries(data)
      .map(([license, packages]) => ({
        license,
        packages: packages
          .map((pkg) => ({
            name: pkg.name,
            versions: Array.isArray(pkg.versions) ? pkg.versions : undefined,
            author: pkg.author ?? undefined,
            homepage: pkg.homepage ?? undefined,
            description: pkg.description ?? undefined,
          }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.license.localeCompare(b.license));
  }, []);

  return (
    <div className="container mx-auto flex h-screen max-w-4xl flex-col p-6">
      <div className="mb-6 flex flex-shrink-0 flex-col gap-2">
        <h1 className="font-bold text-2xl">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>

      <ScrollArea className="flex-1 pb-12">
        <div className="space-y-4 pr-4">
          {licenseGroups.map(({ license, packages }) => (
            <Card key={license}>
              <CardHeader>
                <CardTitle>{license}</CardTitle>
                <CardDescription>
                  {t("licenseCount", { count: packages.length })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {packages.map((pkg) => {
                  const versions = pkg.versions?.join(", ");

                  return (
                    <div
                      key={`${pkg.name}-${versions ?? ""}`}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium">{pkg.name}</p>
                          {versions ? (
                            <p className="text-muted-foreground text-sm">
                              {t("version", { version: versions })}
                            </p>
                          ) : null}
                          {pkg.author ? (
                            <p className="text-muted-foreground text-sm">
                              {t("author", { author: pkg.author })}
                            </p>
                          ) : null}
                        </div>
                        {pkg.homepage ? (
                          <a
                            href={pkg.homepage}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary text-sm"
                          >
                            {t("homepage")}
                            <ExternalLink className="h-4 w-4" aria-hidden />
                          </a>
                        ) : null}
                      </div>
                      {pkg.description ? (
                        <p className="mt-2 text-muted-foreground text-sm">
                          {pkg.description}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
