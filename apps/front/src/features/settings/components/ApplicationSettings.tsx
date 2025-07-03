import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "@/Component/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { SupportedLanguage } from "@/lib/i18n/types";
import type { Theme } from "@/lib/storage/types";
import { useTheme } from "@/lib/theme/context";

export function ApplicationSettings() {
  const { t, i18n } = useTranslation("settings");
  const { theme, setTheme } = useTheme();

  const handleLanguageChange = (value: string) => {
    void i18n.changeLanguage(value as SupportedLanguage);
  };

  const handleThemeChange = (value: string) => {
    if (value) {
      setTheme(value as Theme);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("applicationSettings")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t("theme.title")}</Label>
            <p className="text-muted-foreground text-sm">
              {t("theme.description")}
            </p>
          </div>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={handleThemeChange}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="light">{t("theme.light")}</ToggleGroupItem>
            <ToggleGroupItem value="dark">{t("theme.dark")}</ToggleGroupItem>
            <ToggleGroupItem value="system">
              {t("theme.system")}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>{t("language.title")}</Label>
          <p className="text-muted-foreground text-sm">
            {t("language.description")}
          </p>
          <Select value={i18n.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ja">{t("language.japanese")}</SelectItem>
              <SelectItem value="en">{t("language.english")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
