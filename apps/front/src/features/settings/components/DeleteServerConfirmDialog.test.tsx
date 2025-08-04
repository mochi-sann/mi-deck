import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import { DeleteServerConfirmDialog } from "./DeleteServerConfirmDialog";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "server.deleteConfirm.title": "Delete Server",
        "server.deleteConfirm.message":
          "Are you sure you want to delete the following server?",
        "server.deleteConfirm.warning": "This action cannot be undone",
        "server.deleteConfirm.confirm": "Delete",
        "server.deleteConfirm.cancel": "Cancel",
      };
      return translations[key] || key;
    },
  }),
}));

const mockServer: MisskeyServerConnection = {
  id: "test-server-id",
  origin: "https://test.example.com",
  isActive: true,
  serverInfo: {
    name: "Test Server",
    iconUrl: "https://test.example.com/icon.png",
    version: "13.0.0",
  },
  userInfo: {
    id: "user123",
    username: "testuser",
    name: "Test User",
    avatarUrl: "https://test.example.com/avatar.png",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("DeleteServerConfirmDialog", () => {
  it("should render when open is true and server is provided", () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();

    render(
      <DeleteServerConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        server={mockServer}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(screen.getByText("Delete Server")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete the following server?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Test Server")).toBeInTheDocument();
    expect(screen.getByText("https://test.example.com")).toBeInTheDocument();
    expect(
      screen.getByText("This action cannot be undone"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("should not render when open is false", () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();

    render(
      <DeleteServerConfirmDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        server={mockServer}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(screen.queryByText("Delete Server")).not.toBeInTheDocument();
  });

  it("should not render when server is null", () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();

    render(
      <DeleteServerConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        server={null}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(screen.queryByText("Delete Server")).not.toBeInTheDocument();
  });

  it("should call onConfirm and onOpenChange when delete button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();

    render(
      <DeleteServerConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        server={mockServer}
        onConfirm={mockOnConfirm}
      />,
    );

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should call onOpenChange when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();

    render(
      <DeleteServerConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        server={mockServer}
        onConfirm={mockOnConfirm}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(mockOnConfirm).not.toHaveBeenCalled();
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should display server origin when server name is not available", () => {
    const serverWithoutName = {
      ...mockServer,
      serverInfo: {
        ...mockServer.serverInfo!,
        name: "Test Server Without Info",
      },
    };

    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();

    render(
      <DeleteServerConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        server={serverWithoutName}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(screen.getByText("https://test.example.com")).toBeInTheDocument();
  });

  it("should display server icon when available", () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();

    render(
      <DeleteServerConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        server={mockServer}
        onConfirm={mockOnConfirm}
      />,
    );

    const icon = screen.getByAltText("Test Server");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("src", "https://test.example.com/icon.png");
  });
});
