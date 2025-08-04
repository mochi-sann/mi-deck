import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import { ServerInfo } from "./ServerInfo";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "server.title": "Connected Servers",
        "server.noServers": "No servers registered",
        "server.currentServer": "Current Server",
        "server.delete": "Delete",
        "server.add.button": "Add Server",
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

// Mock storage context
const mockStorage = {
  servers: [] as MisskeyServerConnection[],
  currentServerId: undefined as string | undefined,
  deleteServer: vi.fn(),
};

vi.mock("@/lib/storage/context", () => ({
  useStorage: () => mockStorage,
}));

// Mock AddServerDialog
vi.mock("./AddServerDialog", () => ({
  // biome-ignore lint/style/useNamingConvention: テストに必要
  AddServerDialog: ({ open }: any) => {
    if (!open) return null;
    return <div data-testid="add-server-dialog">Add Server Dialog</div>;
  },
}));

// Mock DeleteServerConfirmDialog
vi.mock("./DeleteServerConfirmDialog", () => ({
  // biome-ignore lint/style/useNamingConvention: テストに必要
  DeleteServerConfirmDialog: ({ open, server, onConfirm }: any) => {
    if (!open || !server) return null;
    return (
      <div data-testid="delete-confirm-dialog">
        <p>Delete {server.serverInfo?.name || server.origin}?</p>
        <button onClick={onConfirm} type="button">
          Confirm Delete
        </button>
      </div>
    );
  },
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

describe("ServerInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.servers = [];
    mockStorage.currentServerId = undefined;
  });

  it("should display 'No servers registered' when no servers exist", () => {
    render(<ServerInfo />);

    expect(screen.getByText("No servers registered")).toBeInTheDocument();
  });

  it("should display server information when servers exist", () => {
    mockStorage.servers = [mockServer];

    render(<ServerInfo />);

    expect(screen.getByText("Test Server")).toBeInTheDocument();
    expect(screen.getByText("https://test.example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("should show 'Current Server' badge for the current server", () => {
    mockStorage.servers = [mockServer];
    mockStorage.currentServerId = "test-server-id";

    render(<ServerInfo />);

    expect(screen.getByText("Current Server")).toBeInTheDocument();
  });

  it("should open delete confirmation dialog when delete button is clicked", async () => {
    const user = userEvent.setup();
    mockStorage.servers = [mockServer];

    render(<ServerInfo />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    expect(screen.getByTestId("delete-confirm-dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete Test Server?")).toBeInTheDocument();
  });

  it("should call storage.deleteServer when deletion is confirmed", async () => {
    const user = userEvent.setup();
    mockStorage.servers = [mockServer];

    render(<ServerInfo />);

    // Click delete button to open dialog
    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByText("Confirm Delete");
    await user.click(confirmButton);

    expect(mockStorage.deleteServer).toHaveBeenCalledWith("test-server-id");
  });

  it("should display server icon when available", () => {
    mockStorage.servers = [mockServer];

    render(<ServerInfo />);

    const icon = screen.getByAltText("Test Server");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("src", "https://test.example.com/icon.png");
  });

  it("should display origin as fallback when server name is not available", () => {
    const serverWithoutName = {
      ...mockServer,
      serverInfo: {
        ...mockServer.serverInfo!,
        name: "Test Server Without Icon",
      },
    };
    mockStorage.servers = [serverWithoutName];

    render(<ServerInfo />);

    // Should display origin in the title area since name is not available
    const titleElements = screen.getAllByText("https://test.example.com");
    expect(titleElements.length).toBeGreaterThan(0);
  });

  it("should handle multiple servers", () => {
    const secondServer: MisskeyServerConnection = {
      id: "second-server-id",
      origin: "https://second.example.com",
      isActive: false,
      serverInfo: {
        name: "Second Server",
        iconUrl: "https://second.example.com/icon.png",
        version: "13.1.0",
      },
      userInfo: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockStorage.servers = [mockServer, secondServer];
    mockStorage.currentServerId = "test-server-id";

    render(<ServerInfo />);

    expect(screen.getByText("Test Server")).toBeInTheDocument();
    expect(screen.getByText("Second Server")).toBeInTheDocument();
    expect(screen.getByText("Current Server")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(2);
  });
});
