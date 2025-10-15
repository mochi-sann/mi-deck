import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Note } from "misskey-js/entities.js";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NoteReplySection } from "./NoteReplySection";

const mockRequest = vi.fn();
const mockUseStorage = vi.fn();
const mockUploadAndCompressFiles = vi.fn();

vi.mock("@/lib/storage/context", () => ({
  useStorage: () => mockUseStorage(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("misskey-js/api.js", () => ({
  // biome-ignore lint/style/useNamingConvention: misskey js
  APIClient: vi.fn().mockImplementation(() => ({
    request: mockRequest,
  })),
}));

vi.mock("@/lib/uploadAndCompresFiles", () => ({
  uploadAndCompressFiles: (...args: unknown[]) =>
    mockUploadAndCompressFiles(...args),
}));

const ResizeObserverMock = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

const createMockNote = (overrides: Partial<Note> = {}): Note =>
  ({
    id: "note-1",
    text: "Original note",
    createdAt: "2023-01-01T00:00:00.000Z",
    user: {
      id: "user-1",
      username: "tester",
      name: "Tester",
      avatarUrl: "https://example.com/avatar.png",
      emojis: {},
    },
    emojis: {},
    files: [],
    ...overrides,
  }) as Note;

describe("NoteReplySection", () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockUploadAndCompressFiles.mockReset();
    mockUploadAndCompressFiles.mockResolvedValue([]);
    mockUseStorage.mockReturnValue({
      servers: [
        {
          id: "server-1",
          origin: "https://misskey.example",
          accessToken: "token-1",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      currentServerId: "server-1",
      isLoading: false,
    });
  });

  it("should open form when reply button is clicked", async () => {
    render(
      <NoteReplySection
        note={createMockNote()}
        origin="https://misskey.example"
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "reply.button" }));

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "compose.submit.reply" }),
    ).toBeInTheDocument();
  });

  it("should send reply with replyId and close form on success", async () => {
    mockRequest.mockResolvedValue({});
    render(
      <NoteReplySection
        note={createMockNote()}
        origin="https://misskey.example"
      />,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "reply.button" }));
    await user.type(screen.getByRole("textbox"), "Hello");
    await user.click(
      screen.getByRole("button", { name: "compose.submit.reply" }),
    );

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith(
        "notes/create",
        expect.objectContaining({
          text: "Hello",
          replyId: "note-1",
          visibility: "public",
          localOnly: false,
        }),
      );
    });

    await waitFor(() => {
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    expect(screen.getByText("reply.success")).toBeInTheDocument();
  });

  it("should show validation error when submitting empty reply", async () => {
    render(
      <NoteReplySection
        note={createMockNote()}
        origin="https://misskey.example"
      />,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "reply.button" }));
    await user.click(
      screen.getByRole("button", { name: "compose.submit.reply" }),
    );

    expect(screen.getByText("compose.error.empty")).toBeInTheDocument();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("should not render reply section for pure renotes", () => {
    const renotedNote = createMockNote({
      id: "renoted-note",
      text: "Renoted content",
    });
    const pureRenote = createMockNote({
      id: "pure-renote",
      text: "",
      renoteId: renotedNote.id,
      renote: renotedNote,
    });

    render(
      <NoteReplySection note={pureRenote} origin="https://misskey.example" />,
    );

    expect(
      screen.queryByRole("button", { name: "reply.button" }),
    ).not.toBeInTheDocument();
  });

  it("should render reply target preview inside modal", async () => {
    render(
      <NoteReplySection
        note={createMockNote({ text: "Preview note content" })}
        origin="https://misskey.example"
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "reply.button" }));

    expect(screen.getByText("Preview note content")).toBeInTheDocument();
  });
});
