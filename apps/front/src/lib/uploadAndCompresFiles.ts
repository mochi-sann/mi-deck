import imageCompression from "browser-image-compression"; // Import the library
import type { DriveFilesCreateResponse } from "misskey-js/entities.js";
// Helper function for file compression and upload
export async function uploadAndCompressFiles(
  files: File[],
  origin: string,
  serverToken: string,
): Promise<string[]> {
  if (files.length === 0) {
    return []; // No files to upload
  }

  console.log("Compressing and uploading files:", files);

  const compressionOptions = {
    // biome-ignore lint/style/useNamingConvention: library option property naming
    maxSizeMB: 1, // Adjust max size as needed
    maxWidthOrHeight: 2048, // Adjust max dimensions as needed
    useWebWorker: true,
    fileType: "image/webp", // Specify WebP output
  };

  // Use Promise.all to compress and upload files concurrently
  const uploadPromises = files.map(async (file) => {
    let fileToUpload = file;
    let fileName = file.name;

    // Check if the file is an image and compress it
    if (file.type.startsWith("image/")) {
      try {
        console.log(`Compressing ${file.name}...`);
        const compressedBlob = await imageCompression(file, compressionOptions);
        // Create a new File object with the compressed data and .webp extension
        fileName = `${file.name}.webp`;
        fileToUpload = new File([compressedBlob], fileName, {
          type: "image/webp",
        });
        console.log(
          `Compressed ${file.name} to ${fileName} (${fileToUpload.size} bytes)`,
        );
      } catch (compressionError) {
        console.error(
          `Could not compress file ${file.name}:`,
          compressionError,
        );
        // Optionally, upload the original file if compression fails,
        // or skip/handle the error differently.
        // Here, we'll proceed to upload the original file.
      }
    }

    const payload = new FormData();
    payload.append("i", serverToken);
    // Use the (potentially compressed) file and its new name
    payload.append("file", fileToUpload, fileName);
    // TODO: Consider using misskey-js client.request for drive upload if possible/preferred
    // This requires checking if misskey-js handles FormData uploads directly or needs adjustments.
    // For now, using fetch directly as before.
    const response = await fetch(`${origin}/api/drive/files/create`, {
      method: "POST",
      body: payload,
      credentials: "omit", // Ensure cookies aren't sent if not needed
      cache: "no-cache",
    });
    if (!response.ok) {
      // Handle HTTP errors (e.g., 4xx, 5xx)
      const errorText = await response.text();
      throw new Error(
        `File upload failed for ${fileName}: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }
    const result: DriveFilesCreateResponse = await response.json();
    return result; // Return the full response object initially
  });

  try {
    const uploadResults = await Promise.all(uploadPromises);
    const uploadedFileIds = uploadResults.map((result) => result.id);
    console.log("Uploaded File IDs:", uploadedFileIds);
    return uploadedFileIds;
  } catch (error) {
    console.error("Error during file upload process:", error);
    // Re-throw the error to be caught by the onSubmit handler
    throw error;
  }
}
