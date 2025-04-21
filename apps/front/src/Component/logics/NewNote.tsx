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
import { Textarea } from "../ui/textarea";

export const NewNote = () => {
  const [files, setFiles] = useState<File[]>([]);

  // TODO: Implement note submission logic including file uploads
  const handleSubmit = () => {
    console.log("Submit note");
    // Add logic to submit the note content and files
    if (files.length > 0) {
      console.log("Selected files:", files);
      // TODO: Add actual file upload logic here
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
