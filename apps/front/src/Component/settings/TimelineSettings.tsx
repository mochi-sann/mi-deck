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

export function TimelineSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>タイムライン設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>自動更新</Label>
            <p className="text-muted-foreground text-sm">
              タイムラインを自動的に更新します
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>画像の自動読み込み</Label>
            <p className="text-muted-foreground text-sm">
              ノートの画像を自動的に読み込みます
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>更新間隔</Label>
          <Select defaultValue="30">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10秒</SelectItem>
              <SelectItem value="30">30秒</SelectItem>
              <SelectItem value="60">1分</SelectItem>
              <SelectItem value="300">5分</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
