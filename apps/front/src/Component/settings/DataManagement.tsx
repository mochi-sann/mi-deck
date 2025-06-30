import { Button } from "@/Component/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Component/ui/card";
import { Separator } from "@/Component/ui/separator";
import { storageManager } from "@/lib/storage";
import { AlertTriangle, Download, Upload } from "lucide-react";
import { useRef, useState } from "react";

export function DataManagement() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const exportData = await storageManager.exportData();

      const blob = new Blob([exportData], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mi-deck-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("データのエクスポートに失敗しました:", error);
      alert("データのエクスポートに失敗しました");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      await storageManager.importData(text);

      // Force refresh to update UI with new data
      window.location.reload();
    } catch (error) {
      console.error("データのインポートに失敗しました:", error);
      alert(
        `データのインポートに失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    } finally {
      setIsImporting(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearData = async () => {
    if (confirm("すべてのデータを削除しますか？この操作は元に戻せません。")) {
      try {
        await storageManager.clearAllData();
        // Force refresh to update UI
        window.location.reload();
      } catch (error) {
        console.error("データの削除に失敗しました:", error);
        alert("データの削除に失敗しました");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>データ管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="mb-2 flex items-center gap-2 font-medium">
              <Download className="h-4 w-4" />
              データのエクスポート
            </h4>
            <p className="mb-3 text-muted-foreground text-sm">
              サーバー情報、タイムライン設定、認証状態をJSONファイルとしてダウンロードします
            </p>
            <Button
              onClick={handleExportData}
              variant="outline"
              disabled={isExporting}
            >
              {isExporting ? "エクスポート中..." : "データをエクスポート"}
            </Button>
          </div>

          <Separator />

          <div>
            <h4 className="mb-2 flex items-center gap-2 font-medium">
              <Upload className="h-4 w-4" />
              データのインポート
            </h4>
            <p className="mb-3 text-muted-foreground text-sm">
              以前にエクスポートしたJSONファイルからデータを復元します（既存のデータは上書きされます）
            </p>
            <Button
              onClick={handleImportClick}
              variant="outline"
              disabled={isImporting}
            >
              {isImporting ? "インポート中..." : "データをインポート"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <Separator />

          <div>
            <h4 className="mb-2 flex items-center gap-2 font-medium text-destructive">
              <AlertTriangle className="h-4 w-4" />
              データの削除
            </h4>
            <p className="mb-3 text-muted-foreground text-sm">
              すべてのサーバー情報、タイムライン設定、認証状態を削除します（この操作は元に戻せません）
            </p>
            <Button onClick={handleClearData} variant="destructive">
              すべてのデータを削除
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
