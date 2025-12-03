import { useAtom } from "jotai";
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
import {
  type NsfwBehavior,
  timelineSettingsAtom,
} from "../stores/timelineSettings";

export function TimelineSettings() {
  const { t } = useTranslation("settings");
  const [settings, setSettings] = useAtom(timelineSettingsAtom);

  const handleNsfwChange = (value: string) => {
    setSettings((prev) => ({ ...prev, nsfwBehavior: value as NsfwBehavior }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("timeline.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t("timeline.autoUpdate.title")}</Label>
            <p className="text-muted-foreground text-sm">
              {t("timeline.autoUpdate.description")}
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t("timeline.autoLoadImages.title")}</Label>
            <p className="text-muted-foreground text-sm">
              {t("timeline.autoLoadImages.description")}
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>{t("timeline.nsfw.title")}</Label>
          <p className="text-muted-foreground text-sm">
            {t("timeline.nsfw.description")}
          </p>
          <Select
            value={settings.nsfwBehavior}
            onValueChange={handleNsfwChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="show">{t("timeline.nsfw.show")}</SelectItem>
              <SelectItem value="blur">{t("timeline.nsfw.blur")}</SelectItem>
              <SelectItem value="hide">{t("timeline.nsfw.hide")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>{t("timeline.updateInterval.title")}</Label>
          <Select defaultValue="30">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">
                {t("timeline.updateInterval.seconds10")}
              </SelectItem>
              <SelectItem value="30">
                {t("timeline.updateInterval.seconds30")}
              </SelectItem>
              <SelectItem value="60">
                {t("timeline.updateInterval.minutes1")}
              </SelectItem>
              <SelectItem value="300">
                {t("timeline.updateInterval.minutes5")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
