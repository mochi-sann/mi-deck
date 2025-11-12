import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Note } from "misskey-js/entities.js";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NoteComposerDialog } from "./NoteComposerDialog";

const mockRequest = vi.fn();
const mockUseStorage = vi.fn();
const mockUploadAndCompressFiles = vi.fn();
const mockToggleRenote = vi.fn();

vi.mock("@/lib/storage/context", () => ({
  useStorage: () => mockUseStorage(),
}));

vi.mock("misskey-js/api.js", () => ({
  // biome-ignore lint/style/useNamingConvention: external lib
  APIClient: vi.fn().mockImplementation(() => ({
    request: mockRequest,
  })),
}));

vi.mock("@/lib/uploadAndCompresFiles", () => ({
  uploadAndCompressFiles: (...args: unknown[]) =>
    mockUploadAndCompressFiles(...args),
}));

vi.mock("react-i18next", () => ({
  useTranslation: (namespace?: string) => ({
    t: (key: string) => key,
    i18n: { language: "en" },
    ready: true,
    isInitialized: true,
    ns: namespace,
  }),
}));

const ResizeObserverMock = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

const createNote = (overrides: Partial<Note> = {}): Note =>
  ({
    id: "note-1",
    text: "Note to quote",
    createdAt: "2024-01-01T00:00:00.000Z",
    user: {
      id: "user-1",
      username: "tester",
      name: "Tester",
      host: "misskey.example",
    },
    emojis: {},
    files: [],
    ...overrides,
  }) as Note;

describe("NoteComposerDialog", () => {
  beforeEach(() => {
    mockUseStorage.mockReturnValue({
      servers: [
        {
          id: "server-1",
          origin: "https://misskey.example",
          accessToken: "token",
          isActive: true,
        },
      ],
      currentServerId: "server-1",
      isLoading: false,
    });
    mockUploadAndCompressFiles.mockResolvedValue([]);
    mockRequest.mockReset();
    mockToggleRenote.mockReset();
    mockToggleRenote.mockResolvedValue(undefined);
  });

  it("opens renote dialog and calls toggleRenote with selected server", async () => {
    render(
      <NoteComposerDialog
        mode="renote"
        open
        renoteTarget={createNote()}
        origin="https://misskey.example"
        renoteContext={{
          isRenoted: false,
          isProcessing: false,
          isStorageLoading: false,
          serversWithToken: [
            {
              id: "server-1",
              origin: "https://misskey.example",
              accessToken: "token",
              isActive: true,
            },
          ],
          determineInitialServerId: () => "server-1",
          toggleRenote: mockToggleRenote,
        }}
      />,
    );

    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: "renote.dialog.action" }),
    );

    expect(mockToggleRenote).toHaveBeenCalledWith("server-1");
  });

  it("renders quote mode and posts with renoteId", async () => {
    mockRequest.mockResolvedValue({});

    render(
      <NoteComposerDialog
        mode="quote"
        open
        replyTarget={createNote()}
        quoteTarget={createNote()}
        origin="https://misskey.example"
      />,
    );

    const user = userEvent.setup();
    const textarea = await screen.findByRole("textbox");
    await user.type(textarea, "Adding a quote");

    await user.click(
      screen.getByRole("button", { name: "compose.submit.quote" }),
    );

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith(
        "notes/create",
        expect.objectContaining({
          renoteId: "note-1",
        }),
      );
    });
  });
});
