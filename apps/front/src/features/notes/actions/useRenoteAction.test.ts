import { act, renderHook } from "@testing-library/react";
import type { Note } from "misskey-js/entities.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRenoteAction } from "./useRenoteAction";

const mockRequest = vi.fn();
const mockUseStorage = vi.fn();
const mockToast = vi.fn();

vi.mock("@/lib/storage/context", () => ({
  useStorage: () => mockUseStorage(),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: (args: unknown) => mockToast(args),
}));

vi.mock("misskey-js/api.js", () => ({
  APIClient: vi.fn().mockImplementation(() => ({
    request: mockRequest,
  })),
}));

const createNote = (overrides: Partial<Note> = {}): Note =>
  ({
    id: "note-1",
    text: "sample note",
    renoteCount: 2,
    user: {
      id: "user-1",
      username: "tester",
      host: "misskey.example",
    },
    emojis: {},
    ...overrides,
  }) as Note;

describe("useRenoteAction", () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockToast.mockReset();
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

  it("increments renote count and stores returned renote id on success", async () => {
    mockRequest.mockResolvedValueOnce({
      createdNote: { id: "renote-123" },
    });

    const { result } = renderHook(() =>
      useRenoteAction({
        note: createNote(),
        origin: "https://misskey.example",
      }),
    );

    expect(result.current.renoteCount).toBe(2);
    await act(async () => {
      await result.current.toggleRenote("server-1");
    });

    expect(mockRequest).toHaveBeenCalledWith("notes/create", {
      renoteId: "note-1",
    });
    expect(result.current.renoteCount).toBe(3);
    expect(result.current.isRenoted).toBe(true);
  });

  it("decrements renote count when unrenoting and uses stored myRenoteId", async () => {
    mockRequest.mockResolvedValueOnce({});

    const { result } = renderHook(() =>
      useRenoteAction({
        note: createNote({
          renoteCount: 5,

          myRenoteId: "renote-existing" as any,
        }),
        origin: "https://misskey.example",
      }),
    );

    expect(result.current.isRenoted).toBe(true);

    await act(async () => {
      await result.current.toggleRenote("server-1");
    });

    expect(mockRequest).toHaveBeenCalledWith("notes/unrenote", {
      noteId: "renote-existing",
    });
    expect(result.current.renoteCount).toBe(4);
    expect(result.current.isRenoted).toBe(false);
  });

  it("rolls back state and shows toast when request fails", async () => {
    mockRequest.mockRejectedValueOnce(new Error("network error"));

    const { result } = renderHook(() =>
      useRenoteAction({
        note: createNote(),
        origin: "https://misskey.example",
      }),
    );

    await act(async () => {
      await result.current.toggleRenote("server-1");
    });

    expect(result.current.renoteCount).toBe(2);
    expect(result.current.isRenoted).toBe(false);
    expect(mockToast).toHaveBeenCalled();
  });
});
