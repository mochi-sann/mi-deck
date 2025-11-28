import { act, renderHook, waitFor } from "@testing-library/react";
import type { Note } from "misskey-js/entities.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNoteComposer } from "./useNoteComposer";

const mockUseStorage = vi.fn();

vi.mock("@/lib/storage/context", () => ({
  useStorage: () => mockUseStorage(),
}));

vi.mock("@/lib/uploadAndCompresFiles", () => ({
  uploadAndCompressFiles: vi.fn().mockResolvedValue([]),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const createNote = (overrides: Partial<Note> = {}): Note =>
  ({
    id: "note-1",
    text: "Note body",
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

describe("useNoteComposer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  it("quoteモードでquoteTargetのuserが欠けていてもフォールバックする", async () => {
    const replyTarget = createNote();
    const quoteTarget = {
      ...createNote(),
      user: undefined,
    } as unknown as Note;

    const { result } = renderHook(() =>
      useNoteComposer({
        mode: "quote",
        replyTarget,
        quoteTarget,
      }),
    );

    await waitFor(() => {
      expect(result.current.form.getValues("serverSessionId")).toBe("server-1");
    });
  });

  it("quoteOriginが存在する場合はそれに一致するサーバーを選択する", async () => {
    mockUseStorage.mockReturnValueOnce({
      servers: [
        {
          id: "server-1",
          origin: "https://misskey.example",
          accessToken: "token",
          isActive: true,
        },
        {
          id: "server-2",
          origin: "https://remote.example",
          accessToken: "token-2",
          isActive: true,
        },
      ],
      currentServerId: "server-1",
      isLoading: false,
    });

    const note = createNote({
      user: { ...createNote().user, host: "remote.example" },
    });

    const { result } = renderHook(() =>
      useNoteComposer({
        mode: "quote",
        quoteTarget: note,
        quoteOrigin: "https://remote.example",
      }),
    );

    await waitFor(() => {
      expect(result.current.form.getValues("serverSessionId")).toBe("server-2");
    });
  });

  it("resetStateは選択中のサーバーと公開範囲を維持したままフォームを初期化する", async () => {
    const { result } = renderHook(() =>
      useNoteComposer({
        mode: "create",
      }),
    );

    await waitFor(() => {
      expect(result.current.form.getValues("serverSessionId")).toBe("server-1");
    });

    act(() => {
      result.current.setFiles([{ name: "dummy" }] as unknown as File[]);
      result.current.form.setValue("noteContent", "Draft content");
      result.current.form.setValue("visibility", "home");
    });

    act(() => {
      result.current.resetState();
    });

    expect(result.current.files).toEqual([]);
    expect(result.current.form.getValues("noteContent")).toBe("");
    expect(result.current.form.getValues("visibility")).toBe("home");
    expect(result.current.form.getValues("serverSessionId")).toBe("server-1");
  });
});
