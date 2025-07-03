import { useTranslation } from "react-i18next";
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
import { Switch } from "@/components/ui/switch";
import type { SupportedLanguage } from "@/lib/i18n/types";
import { useTheme } from "@/lib/theme/context";

export function ApplicationSettings() {
  const { t, i18n } = useTranslation("settings");
  const { theme, setTheme, actualTheme } = useTheme();

  const handleLanguageChange = (value: string) => {
    void i18n.changeLanguage(value as SupportedLanguage);
  };

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("applicationSettings")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="theme-toggle">{t("theme.title")}</Label>
            <p className="text-muted-foreground text-sm">
              {t("theme.description")}
            </p>
          </div>
          <Switch
            id="theme-toggle"
            checked={actualTheme === "dark"}
            onCheckedChange={handleThemeChange}
          />
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
