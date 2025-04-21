import { $api } from "@/lib/api/fetchClient";
import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

export const NewNote = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedServerSessionId, setSelectedServerSessionId] = useState<
    string | undefined
  >(undefined);

  const { data: serverSessions, isLoading: isLoadingServers } = $api.useQuery(
    "get",
    "/v1/server-sessions",
    {},
  );

  // TODO: Implement note submission logic including file uploads and selected server
  const handleSubmit = () => {
    console.log("Submit note");
    console.log("Selected Server Session ID:", selectedServerSessionId);
    // Add logic to submit the note content and files to the selected server
    if (files.length > 0) {
      console.log("Selected files:", files);
      // TODO: Add actual file upload logic here
    }
    if (!selectedServerSessionId) {
      console.error("No server selected");
      // TODO: Add user feedback (e.g., show an error message)
      return;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>新しいノートを作成</DialogTitle>
        <DialogDescription>ノートの内容を入力してください。</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div>
          <Label htmlFor="server-select">投稿先サーバー</Label>
          <Select
            onValueChange={setSelectedServerSessionId}
            value={selectedServerSessionId}
            disabled={isLoadingServers || !serverSessions}
          >
            <SelectTrigger id="server-select" className="w-full">
              <SelectValue
                placeholder={
                  isLoadingServers
                    ? "サーバーを読み込み中..."
                    : "サーバーを選択..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {serverSessions?.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  {/* TODO: Display a more user-friendly name if available, e.g., from serverInfo */}
                  {session.origin}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea placeholder="ここにノートの内容を入力..." rows={4} />
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="picture">ファイルを選択</Label>
          <Input
            id="picture"
            className="w-full"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          {/* Optionally display selected file names */}
          {files.length > 0 && (
            <div className="mt-2 text-muted-foreground text-sm">
              選択中のファイル: {files.map((file) => file.name).join(", ")}
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" onClick={handleSubmit}>
          投稿
        </Button>
      </DialogFooter>
    </>
  );
};
