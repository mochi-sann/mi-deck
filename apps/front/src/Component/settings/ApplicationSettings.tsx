import { Card, CardContent, CardHeader, CardTitle } from "@/Component/ui/card";
import { Label } from "@/Component/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Component/ui/select";
import { Separator } from "@/Component/ui/separator";
import { Switch } from "@/Component/ui/switch";

export function ApplicationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>アプリケーション設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="theme-toggle">ダークモード</Label>
            <p className="text-muted-foreground text-sm">
              アプリの外観をダークテーマに切り替えます
            </p>
          </div>
          <Switch id="theme-toggle" />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>言語設定</Label>
          <Select defaultValue="ja">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
