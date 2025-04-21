import { Button } from "../ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";

export const NewNote = () => {
  // TODO: Implement note submission logic
  const handleSubmit = () => {
    console.log("Submit note");
    // Add logic to submit the note content
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>新しいノートを作成</DialogTitle>
        <DialogDescription>
          ノートの内容を入力してください。
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <Textarea placeholder="ここにノートの内容を入力..." rows={4} />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            キャンセル
          </Button>
        </DialogClose>
        <Button type="submit" onClick={handleSubmit}>
          投稿
        </Button>
      </DialogFooter>
    </>
  );
};
