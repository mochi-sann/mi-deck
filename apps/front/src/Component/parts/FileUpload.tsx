import { X } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { IconButton } from "../ui/icon-button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
}) => {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Generate previews when files change externally or internally
  useEffect(() => {
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    // Clean up old previews before setting new ones
    for (const imagePreview of imagePreviews) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreviews(newPreviews);

    // Cleanup function for when the component unmounts or files change again
    return () => {
      for (const url of newPreviews) {
        URL.revokeObjectURL(url);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]); // Rerun when the files prop changes

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;
      if (selectedFiles) {
        const fileArray = Array.from(selectedFiles);
        onFilesChange(fileArray); // Update parent state
      } else {
        onFilesChange([]); // Clear files if selection is cancelled
      }
      // Reset the input value to allow selecting the same file again
      event.target.value = "";
    },
    [onFilesChange],
  );

  const handleRemoveImage = useCallback(
    (indexToRemove: number) => {
      // Update parent state by filtering
      onFilesChange(files.filter((_, index) => index !== indexToRemove));
    },
    [files, onFilesChange],
  );

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="picture">ファイルを選択</Label>
      <Input
        id="picture"
        className="w-full"
        type="file"
        multiple
        accept="image/*" // Only accept image files
        onChange={handleFileChange}
      />
      {/* Display Image Previews with Delete Buttons */}
      {imagePreviews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {imagePreviews.map((previewUrl, index) => (
            <div key={previewUrl} className="group relative">
              <img
                src={previewUrl}
                alt={`Preview ${index + 1}`}
                className="h-24 w-full rounded-md object-cover"
              />
              <IconButton
                type="button" // Prevent form submission
                variant="default"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 cursor-pointer rounded-full p-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                onClick={() => handleRemoveImage(index)}
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </IconButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
