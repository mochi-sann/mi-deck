import imageCompression from "browser-image-compression";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadAndCompressFiles } from "./uploadAndCompresFiles";

// Mock imageCompression
vi.mock("browser-image-compression", () => ({
  default: vi.fn(),
}));

describe("uploadAndCompressFiles", () => {
  const mockOrigin = "https://example.com";
  const mockServerToken = "test-token";
  const mockFileId = "file123";

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return empty array when no files are provided", async () => {
    const result = await uploadAndCompressFiles(
      [],
      mockOrigin,
      mockServerToken,
    );
    expect(result).toEqual([]);
  });

  it("should compress and upload image files successfully", async () => {
    // Mock image file
    const mockImageFile = new File(["test"], "test.jpg", {
      type: "image/jpeg",
    });

    // Mock compressed blob
    const mockCompressedBlob = new Blob(["compressed"], { type: "image/webp" });

    // Mock imageCompression
    // biome-ignore lint/suspicious/noExplicitAny: Mock function type assertion Mock function type assertion
    (imageCompression as any).mockResolvedValue(mockCompressedBlob);

    // Mock successful API response
    // biome-ignore lint/suspicious/noExplicitAny: Mock function type assertion
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: mockFileId }),
    });

    const result = await uploadAndCompressFiles(
      [mockImageFile],
      mockOrigin,
      mockServerToken,
    );

    // Verify imageCompression was called with correct options
    expect(imageCompression).toHaveBeenCalledWith(mockImageFile, {
      // biome-ignore lint/style/useNamingConvention: library option property naming
      maxSizeMB: 1,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
      fileType: "image/webp",
    });

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      `${mockOrigin}/api/drive/files/create`,
      expect.objectContaining({
        method: "POST",
        credentials: "omit",
        cache: "no-cache",
      }),
    );

    // Verify the result
    expect(result).toEqual([mockFileId]);
  });

  it("should handle non-image files without compression", async () => {
    // Mock non-image file
    const mockNonImageFile = new File(["test"], "test.txt", {
      type: "text/plain",
    });

    // Mock successful API response
    // biome-ignore lint/suspicious/noExplicitAny: Mock function type assertion
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: mockFileId }),
    });

    const result = await uploadAndCompressFiles(
      [mockNonImageFile],
      mockOrigin,
      mockServerToken,
    );

    // Verify imageCompression was not called
    expect(imageCompression).not.toHaveBeenCalled();

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      `${mockOrigin}/api/drive/files/create`,
      expect.objectContaining({
        method: "POST",
        credentials: "omit",
        cache: "no-cache",
      }),
    );

    // Verify the result
    expect(result).toEqual([mockFileId]);
  });

  it("should handle compression failure gracefully", async () => {
    // Mock image file
    const mockImageFile = new File(["test"], "test.jpg", {
      type: "image/jpeg",
    });

    // Mock compression failure
    // biome-ignore lint/suspicious/noExplicitAny: Mock function type assertion
    (imageCompression as any).mockRejectedValue(
      new Error("Compression failed"),
    );

    // Mock successful API response
    // biome-ignore lint/suspicious/noExplicitAny: Mock function type assertion
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: mockFileId }),
    });

    const result = await uploadAndCompressFiles(
      [mockImageFile],
      mockOrigin,
      mockServerToken,
    );

    // Verify imageCompression was called
    expect(imageCompression).toHaveBeenCalled();

    // Verify fetch was called with original file
    expect(global.fetch).toHaveBeenCalledWith(
      `${mockOrigin}/api/drive/files/create`,
      expect.objectContaining({
        method: "POST",
        credentials: "omit",
        cache: "no-cache",
      }),
    );

    // Verify the result
    expect(result).toEqual([mockFileId]);
  });

  it("should handle upload failure", async () => {
    // Mock image file
    const mockImageFile = new File(["test"], "test.jpg", {
      type: "image/jpeg",
    });

    // Mock successful compression
    const mockCompressedBlob = new Blob(["compressed"], { type: "image/webp" });
    // biome-ignore lint/suspicious/noExplicitAny: Mock function type assertion
    (imageCompression as any).mockResolvedValue(mockCompressedBlob);

    // Mock failed API response
    // biome-ignore lint/suspicious/noExplicitAny: Mock function type assertion
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: () => Promise.resolve("Server error"),
    });

    await expect(
      uploadAndCompressFiles([mockImageFile], mockOrigin, mockServerToken),
    ).rejects.toThrow("File upload failed");
  });

  it("should handle multiple files concurrently", async () => {
    // Mock multiple files
    const mockFiles = [
      new File(["test1"], "test1.jpg", { type: "image/jpeg" }),
      new File(["test2"], "test2.txt", { type: "text/plain" }),
    ];

    // Mock successful compression for image file
    const mockCompressedBlob = new Blob(["compressed"], { type: "image/webp" });
    // biome-ignore lint/suspicious/noExplicitAny: Mock function type assertion
    (imageCompression as any).mockResolvedValue(mockCompressedBlob);

    // Mock successful API responses
    // biome-ignore lint/suspicious/noExplicitAny: Mock function type assertion
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "file1" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "file2" }),
      });

    const result = await uploadAndCompressFiles(
      mockFiles,
      mockOrigin,
      mockServerToken,
    );

    // Verify imageCompression was called only for the image file
    expect(imageCompression).toHaveBeenCalledTimes(1);

    // Verify fetch was called twice
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // Verify the results - order doesn't matter since files are processed concurrently
    expect(result).toHaveLength(2);
    expect(result).toContain("file1");
    expect(result).toContain("file2");
  });
});
