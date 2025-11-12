import { renderHook } from "@testing-library/react";
import type { Note } from "misskey-js/entities.js";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { useMisskeyNoteEmojis } from "./useMisskeyNoteEmojis";

const { mockUseNoteEmojis } = vi.hoisted(() => ({
  mockUseNoteEmojis: vi.fn() as Mock,
}));
vi.mock("@/features/reactions/hooks/useNoteEmojis", () => ({
  useNoteEmojis: mockUseNoteEmojis,
}));

const createMockNote = (overrides: Partial<Note> = {}): Note =>
  ({
    id: "note-1",
    createdAt: "2024-01-01T00:00:00.000Z",
    text: "Hello :wave:",
    user: {
      id: "user-1",
      username: "mockuser",
      name: "Mock User",
      host: null,
      avatarUrl: "https://example.com/avatar.png",
      emojis: {},
    },
    emojis: {},
    reactionEmojis: {},
    ...overrides,
  }) as Note;

describe("useMisskeyNoteEmojis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("指定したoriginと取得した絵文字を返す", () => {
    const note = createMockNote();
    const origin = "misskey.example.com";
    const allEmojis = { wave: "https://example.com/wave.png" };

    mockUseNoteEmojis.mockReturnValue({ allEmojis });

    const { result } = renderHook(() => useMisskeyNoteEmojis(note, origin));

    expect(mockUseNoteEmojis).toHaveBeenCalledWith(note, origin);
    expect(result.current.host).toBe(origin);
    expect(result.current.emojis).toBe(allEmojis);
    expect(result.current.contextValue).toEqual({
      host: origin,
      emojis: allEmojis,
    });
  });

  it("originが空文字の場合はhostを空文字にする", () => {
    const note = createMockNote();
    const origin = "";
    const allEmojis = {};

    mockUseNoteEmojis.mockReturnValue({ allEmojis });

    const { result } = renderHook(() => useMisskeyNoteEmojis(note, origin));

    expect(result.current.host).toBe("");
    expect(result.current.contextValue.host).toBe("");
    expect(result.current.contextValue.emojis).toBe(allEmojis);
  });

  it("同じ絵文字参照で再レンダリングしてもcontextValueが安定する", () => {
    const note = createMockNote();
    const origin = "misskey.example.com";
    const allEmojis = { sparkle: "https://example.com/sparkle.png" };

    mockUseNoteEmojis.mockReturnValue({ allEmojis });

    const { result, rerender } = renderHook(
      ({ target }) => useMisskeyNoteEmojis(target.note, target.origin),
      {
        initialProps: { target: { note, origin } },
      },
    );

    const firstContext = result.current.contextValue;

    rerender({ target: { note, origin } });

    expect(result.current.contextValue).toBe(firstContext);
  });
});
