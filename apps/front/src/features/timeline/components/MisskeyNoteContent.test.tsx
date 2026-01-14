import { fireEvent, render, screen } from "@testing-library/react";
import { useAtomValue } from "jotai";
import type { Note } from "misskey-js/entities.js";
import { describe, expect, it, vi } from "vitest";
import { MisskeyNoteContent } from "./MisskeyNoteContent";

// Mock dependencies
vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();
  return {
    ...actual,
    useAtomValue: vi.fn(),
  };
});

vi.mock("@/features/emoji", () => ({
  CustomEmojiCtx: {
    Provider: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  },
}));

vi.mock("@/features/mfm", () => ({
  MfmText: ({ text }: { text: string }) => (
    <span data-testid="mfm-text">{text}</span>
  ),
}));

vi.mock("@/features/reactions/components/ReactionButton", () => ({
  ReactionButton: () => <div data-testid="reaction-button" />,
}));

vi.mock("../../reactions/components/NoteReactions", () => ({
  NoteReactions: () => <div data-testid="note-reactions" />,
}));

vi.mock("./RenoteMenu", () => ({
  RenoteMenu: () => <div data-testid="renote-menu" />,
}));

vi.mock("@/features/notes/components/NoteReplySection", () => ({
  NoteReplySection: () => <div data-testid="note-reply-section" />,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../hooks/useMisskeyNoteEmojis", () => ({
  useMisskeyNoteEmojis: () => ({
    emojis: {},
    contextValue: {},
  }),
}));
vi.mock("@/lib/storage/context", () => ({
  useStorage: () => ({
    servers: [],
    addTimeline: vi.fn(),
  }),
}));

const createMockNote = (overrides: Partial<Note> = {}): Note =>
  ({
    id: "note123",
    text: "Test note content",
    user: {
      id: "user123",
      username: "testuser",
      name: "Test User",
    },
    files: [],
    ...overrides,
  }) as Note;

describe("MisskeyNoteContent NSFW Behavior", () => {
  const origin = "misskey.example.com";
  const emojis = {};

  it("should hide content when behavior is 'hide' and note is NSFW", () => {
    vi.mocked(useAtomValue).mockReturnValue({
      nsfwBehavior: "hide",
      noteContentMaxHeight: 320,
    });
    const note = createMockNote({
      cw: "NSFW Content",
      text: "Hidden content",
    });

    render(<MisskeyNoteContent note={note} origin={origin} emojis={emojis} />);

    // Should show placeholder
    expect(screen.getByText("timeline.nsfw.title")).toBeInTheDocument();
    expect(screen.getByText("timeline.nsfw.show")).toBeInTheDocument();

    // Should not show content initially
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();

    // Reveal content
    fireEvent.click(screen.getByText("timeline.nsfw.show"));
    expect(screen.getByText("Hidden content")).toBeInTheDocument();
  });

  it("should blur images when behavior is 'blur' and image is sensitive", () => {
    vi.mocked(useAtomValue).mockReturnValue({
      nsfwBehavior: "blur",
      noteContentMaxHeight: 320,
    });
    const note = createMockNote({
      files: [
        {
          id: "file1",
          url: "https://example.com/nsfw.jpg",
          type: "image/jpeg",
          isSensitive: true,
          // Add other required properties for Note type
          createdAt: "2023-01-01",
          name: "nsfw.jpg",
          md5: "hash",
          size: 100,
          blurhash: null,
          properties: { width: 100, height: 100 },
          comment: null,
          thumbnailUrl: null,
          folderId: null,
          userId: null,
          user: null,
        },
      ],
    });

    render(<MisskeyNoteContent note={note} origin={origin} emojis={emojis} />);

    const imageContainer = screen.getByRole("button", {
      name: "画像を拡大表示",
    });
    const image = screen.getByAltText("Note Attachment");
    const label = screen.getByText("sensitive");

    // Check initial state
    expect(image).toHaveClass("blur-xl");
    expect(label).toBeInTheDocument();

    // Click to unblur
    fireEvent.click(imageContainer);

    // Check revealed state
    expect(image).not.toHaveClass("blur-xl");
    expect(label).not.toBeInTheDocument();
    expect(imageContainer).not.toHaveClass("cursor-pointer");
  });

  it("should show content normally when behavior is 'show'", () => {
    vi.mocked(useAtomValue).mockReturnValue({
      nsfwBehavior: "show",
      noteContentMaxHeight: 320,
    });
    const note = createMockNote({
      cw: "NSFW Content",
      text: "Visible content",
      files: [
        {
          id: "file1",
          url: "https://example.com/nsfw.jpg",
          type: "image/jpeg",
          isSensitive: true,
          createdAt: "2023-01-01",
          name: "nsfw.jpg",
          md5: "hash",
          size: 100,
          blurhash: null,
          properties: { width: 100, height: 100 },
          comment: null,
          thumbnailUrl: null,
          folderId: null,
          userId: null,
          user: null,
        },
      ],
    });

    render(<MisskeyNoteContent note={note} origin={origin} emojis={emojis} />);

    // Should show content directly
    expect(screen.getByText("Visible content")).toBeInTheDocument();

    // Image should not be blurred
    const image = screen.getByAltText("Note Attachment");
    expect(image).not.toHaveClass("blur-xl");
    expect(screen.queryByText("sensitive")).not.toBeInTheDocument();
  });
});

describe("MisskeyNoteContent max height", () => {
  const origin = "misskey.example.com";
  const emojis = {};

  const defineElementHeights = (
    scrollHeight: number,
    clientHeight: number,
  ) => {
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        return scrollHeight;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get() {
        return clientHeight;
      },
    });
  };

  it("shows a show-more button when height is limited and content overflows", () => {
    vi.mocked(useAtomValue).mockReturnValue({
      nsfwBehavior: "show",
      noteContentMaxHeight: 240,
    });
    defineElementHeights(600, 200);

    const note = createMockNote({
      text: "Very long content that should overflow.",
    });

    render(<MisskeyNoteContent note={note} origin={origin} emojis={emojis} />);

    const showMoreButton = screen.getByText("note.showMore");
    expect(showMoreButton).toBeInTheDocument();

    fireEvent.click(showMoreButton);
    expect(screen.queryByText("note.showMore")).not.toBeInTheDocument();
  });

  it("does not show a show-more button when height is unlimited", () => {
    vi.mocked(useAtomValue).mockReturnValue({
      nsfwBehavior: "show",
      noteContentMaxHeight: null,
    });
    defineElementHeights(600, 200);

    const note = createMockNote({
      text: "Very long content but unlimited height.",
    });

    render(<MisskeyNoteContent note={note} origin={origin} emojis={emojis} />);

    expect(screen.queryByText("note.showMore")).not.toBeInTheDocument();
  });
});
