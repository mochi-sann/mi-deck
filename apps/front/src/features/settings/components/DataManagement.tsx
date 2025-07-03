import { AlertTriangle, Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { storageManager } from "@/lib/storage";

export function DataManagement() {
  const { t } = useTranslation("settings");
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
      console.error("Data export failed:", error);
      alert(t("dataManagement.export.error"));
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
      console.error("Data import failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("dataManagement.import.unknownError");
      alert(
        t("dataManagement.import.errorWithMessage", { message: errorMessage }),
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
    if (confirm(t("dataManagement.clear.confirm"))) {
      try {
        await storageManager.clearAllData();
        // Force refresh to update UI
        window.location.reload();
      } catch (error) {
        console.error("Data deletion failed:", error);
        alert(t("dataManagement.clear.error"));
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dataManagement.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="mb-2 flex items-center gap-2 font-medium">
              <Download className="h-4 w-4" />
              {t("dataManagement.export.title")}
            </h4>
            <p className="mb-3 text-muted-foreground text-sm">
              {t("dataManagement.export.description")}
            </p>
            <Button
              onClick={handleExportData}
              variant="outline"
              disabled={isExporting}
            >
              {isExporting
                ? t("dataManagement.export.inProgress")
                : t("dataManagement.export.button")}
            </Button>
          </div>

          <Separator />

          <div>
            <h4 className="mb-2 flex items-center gap-2 font-medium">
              <Upload className="h-4 w-4" />
              {t("dataManagement.import.title")}
            </h4>
            <p className="mb-3 text-muted-foreground text-sm">
              {t("dataManagement.import.description")}
            </p>
            <Button
              onClick={handleImportClick}
              variant="outline"
              disabled={isImporting}
            >
              {isImporting
                ? t("dataManagement.import.inProgress")
                : t("dataManagement.import.button")}
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
              {t("dataManagement.clear.title")}
            </h4>
            <p className="mb-3 text-muted-foreground text-sm">
              {t("dataManagement.clear.description")}
            </p>
            <Button onClick={handleClearData} variant="destructive">
              {t("dataManagement.clear.button")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
