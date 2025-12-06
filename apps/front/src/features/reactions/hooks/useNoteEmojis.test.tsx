import { renderHook, waitFor } from "@testing-library/react";
import type { Note } from "misskey-js/entities.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNoteEmojis } from "./useNoteEmojis";

const { mockFetchEmojis, mockUseCustomEmojis } = vi.hoisted(() => ({
  mockFetchEmojis: vi.fn(),
  mockUseCustomEmojis: vi.fn(),
}));

vi.mock("@/hooks/useCustomEmojis", () => ({
  useCustomEmojis: mockUseCustomEmojis,
}));

vi.mock("@/lib/utils/emoji-proxy", () => ({
  createProxiedEmojis: (emojis: Record<string, string>) => emojis,
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

describe("useNoteEmojis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchEmojis.mockResolvedValue({});
    mockUseCustomEmojis.mockReturnValue({
      fetchEmojis: mockFetchEmojis,
    });
  });

  it("should NOT fetch emoji if it exists in note.emojis", async () => {
    const note = createMockNote({
      text: "Hello :wave:",
      emojis: {
        wave: "https://example.com/wave.png",
      },
    });
    const origin = "misskey.example.com";

    renderHook(() => useNoteEmojis(note, origin));

    await waitFor(() => {
      expect(mockFetchEmojis).not.toHaveBeenCalled();
    });
  });

  it("should fetch emoji if it DOES NOT exist in note.emojis", async () => {
    const note = createMockNote({
      text: "Hello :unknown:",
      emojis: {},
    });
    const origin = "misskey.example.com";

    renderHook(() => useNoteEmojis(note, origin));

    await waitFor(() => {
      expect(mockFetchEmojis).toHaveBeenCalledWith(["unknown"]);
    });
  });

  it("should fetch emoji if one exists and another does not", async () => {
    const note = createMockNote({
      text: "Hello :wave: :unknown:",
      emojis: {
        wave: "https://example.com/wave.png",
      },
    });
    const origin = "misskey.example.com";

    renderHook(() => useNoteEmojis(note, origin));

    await waitFor(() => {
      expect(mockFetchEmojis).toHaveBeenCalledWith(["unknown"]);
    });
  });

  it("should NOT fetch emoji for REMOTE note if it exists in note.emojis", async () => {
    const note = createMockNote({
      text: "Hello :remoteEmoji:",
      emojis: {
        remoteEmoji: "https://remote.server/emoji.png",
      },
      user: {
        ...createMockNote().user,
        host: "remote.server",
      },
    });
    const origin = "remote.server"; // Viewing from remote setup context

    renderHook(() => useNoteEmojis(note, origin));

    await waitFor(() => {
      expect(mockFetchEmojis).not.toHaveBeenCalled();
    });
  });

  it("should handle case sensitivity correctly (should NOT fetch if lower case exists)", async () => {
    const note = createMockNote({
      text: "Hello :Wave:",
      emojis: {
        wave: "https://example.com/wave.png", // lowercase in definition
      },
    });
    const origin = "misskey.example.com";

    renderHook(() => useNoteEmojis(note, origin));

    await waitFor(() => {
      expect(mockFetchEmojis).not.toHaveBeenCalled();
    });
  });
});
