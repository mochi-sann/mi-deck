import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileUpload } from "./FileUpload";

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectUrl = vi.fn();
const mockRevokeObjectUrl = vi.fn();

describe("FileUpload Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Mock URL methods
    URL.createObjectURL = mockCreateObjectUrl;
    URL.revokeObjectURL = mockRevokeObjectUrl;
  });

  it("renders file input and label", () => {
    const mockOnFilesChange = vi.fn();
    render(<FileUpload files={[]} onFilesChange={mockOnFilesChange} />);

    const input = screen.getByLabelText("ファイルを選択");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "file");
  });

  it("handles file selection", async () => {
    const mockOnFilesChange = vi.fn();
    render(<FileUpload files={[]} onFilesChange={mockOnFilesChange} />);

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = screen.getByLabelText("ファイルを選択");

    // Mock createObjectURL to return a URL
    mockCreateObjectUrl.mockReturnValue("blob:test-url");

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockOnFilesChange).toHaveBeenCalledWith([file]);
  });

  it("displays image previews when files are provided", () => {
    const mockOnFilesChange = vi.fn();
    const files = [
      new File(["test1"], "test1.png", { type: "image/png" }),
      new File(["test2"], "test2.png", { type: "image/png" }),
    ];

    // Mock createObjectURL to return different URLs for each file
    mockCreateObjectUrl.mockReturnValueOnce("blob:test-url-1");
    mockCreateObjectUrl.mockReturnValueOnce("blob:test-url-2");

    render(<FileUpload files={files} onFilesChange={mockOnFilesChange} />);

    const previews = screen.getAllByRole("img");
    expect(previews).toHaveLength(2);
    expect(previews[0]).toHaveAttribute("src", "blob:test-url-1");
    expect(previews[1]).toHaveAttribute("src", "blob:test-url-2");
  });

  it("handles file removal", async () => {
    const mockOnFilesChange = vi.fn();
    const files = [
      new File(["test1"], "test1.png", { type: "image/png" }),
      new File(["test2"], "test2.png", { type: "image/png" }),
    ];

    // Mock createObjectURL to return different URLs for each file
    mockCreateObjectUrl.mockReturnValueOnce("blob:test-url-1");
    mockCreateObjectUrl.mockReturnValueOnce("blob:test-url-2");

    render(<FileUpload files={files} onFilesChange={mockOnFilesChange} />);

    const removeButtons = screen.getAllByRole("button");
    expect(removeButtons).toHaveLength(2);

    // Remove the first image
    fireEvent.click(removeButtons[0]);

    // Check if onFilesChange was called with the remaining file
    expect(mockOnFilesChange).toHaveBeenCalledWith([files[1]]);
  });

  it("cleans up object URLs when unmounting", () => {
    const mockOnFilesChange = vi.fn();
    const files = [new File(["test1"], "test1.png", { type: "image/png" })];

    mockCreateObjectUrl.mockReturnValue("blob:test-url-1");

    const { unmount } = render(
      <FileUpload files={files} onFilesChange={mockOnFilesChange} />,
    );

    unmount();

    expect(mockRevokeObjectUrl).toHaveBeenCalledWith("blob:test-url-1");
  });

  it("cleans up old object URLs when files change", async () => {
    const mockOnFilesChange = vi.fn();
    const initialFiles = [
      new File(["test1"], "test1.png", { type: "image/png" }),
    ];
    const newFiles = [new File(["test2"], "test2.png", { type: "image/png" })];

    mockCreateObjectUrl.mockReturnValueOnce("blob:old-url");
    mockCreateObjectUrl.mockReturnValueOnce("blob:new-url");

    const { rerender } = render(
      <FileUpload files={initialFiles} onFilesChange={mockOnFilesChange} />,
    );

    // Change files
    rerender(<FileUpload files={newFiles} onFilesChange={mockOnFilesChange} />);

    // Wait for the effect to run
    await waitFor(() => {
      expect(mockRevokeObjectUrl).toHaveBeenCalledWith("blob:old-url");
    });
  });
});
