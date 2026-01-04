import { render, screen } from "@testing-library/react";
import type { Note } from "misskey-js/entities.js";
import { describe, expect, it, vi } from "vitest";
import { MisskeyNote } from "./MisskeyNote";

// Mock dependencies
vi.mock("@/features/emoji", () => ({
  CustomEmojiCtx: {
    Provider: ({
      children,
      value,
    }: {
      children: React.ReactNode;

      value: any;
    }) => (
      <div data-testid="emoji-context" data-value={JSON.stringify(value)}>
        {children}
      </div>
    ),
  },
}));

vi.mock("@/features/mfm", () => ({
  MfmText: ({
    text,
    host,
    emojis,
  }: {
    text: string;
    host: string;

    emojis: any;
  }) => (
    <div data-testid="mfm-text">
      <span data-testid="mfm-text-content">{text}</span>
      <span data-testid="mfm-host">{host}</span>
      <span data-testid="mfm-emojis">{JSON.stringify(emojis)}</span>
    </div>
  ),
}));

// Mock reactions components to avoid React Query provider requirement
vi.mock("@/features/reactions/components/ReactionButton", () => ({
  ReactionButton: () => <div data-testid="reaction-button" />,
}));
vi.mock("@/features/reactions/components/NoteReactions", () => ({
  NoteReactions: () => <div data-testid="note-reactions" />,
}));

vi.mock("./RenoteMenu", () => ({
  RenoteMenu: () => <div data-testid="renote-menu" />,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/features/notes/components/NoteReplySection", () => ({
  NoteReplySection: () => <div data-testid="note-reply-section" />,
}));
vi.mock("@/features/notes/actions/useRenoteAction", () => ({
  useRenoteAction: () => ({
    renoteCount: 0,
    isRenoted: false,
    isProcessing: false,
    canRenote: false,
    isStorageLoading: false,
    serversWithToken: [],
    determineInitialServerId: () => undefined,
    toggleRenote: vi.fn(),
  }),
}));
vi.mock("@/lib/storage/context", () => ({
  useStorage: () => ({
    servers: [],
    addTimeline: vi.fn(),
  }),
}));
vi.mock("@/lib/utils/emoji-proxy", () => ({
  createProxiedEmojis: (emojis: any, host: string) => {
    if (!emojis || !host) return emojis;

    const proxied: any = {};
    for (const [name, url] of Object.entries(emojis)) {
      proxied[name] =
        `https://${host}/proxy/emoji.webp?url=${encodeURIComponent(url as string)}&emoji=1`;
    }
    return proxied;
  },
}));

// Mock UI components
vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className: string;
  }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),

  AvatarImage: ({ src }: { src: string | null }) => {
    const imgProps = src ? { src } : {};
    return <img data-testid="avatar-image" {...imgProps} alt="avatar" />;
  },

  AvatarFallback: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className: string;
  }) => (
    <div data-testid="avatar-fallback" className={className}>
      {children}
    </div>
  ),
}));

const createMockNote = (overrides: Partial<Note> = {}): Note =>
  ({
    id: "note123",
    text: "Hello world :smile:",
    createdAt: "2023-01-01T00:00:00.000Z",
    user: {
      id: "user123",
      username: "testuser",
      name: "Test User",
      avatarUrl: "https://example.com/avatar.jpg",
      emojis: {
        user_emoji: "https://example.com/user-emoji.png",
      },
    },
    emojis: {
      smile: "https://example.com/smile.png",
    },
    files: [],
    ...overrides,
  }) as Note;

describe("MisskeyNote", () => {
  it("should show reply badge when note is a reply", () => {
    const note = createMockNote({
      replyId: "parent-note",
    });
    const origin = "misskey.example.com";

    render(<MisskeyNote note={note} origin={origin} />);

    const link = screen.getByRole("link", { name: "reply.badge" });
    expect(link).toHaveAttribute(
      "href",
      "https://misskey.example.com/notes/parent-note",
    );
  });

  it("should render note with basic content", () => {
    const note = createMockNote();
    const origin = "misskey.example.com";

    render(<MisskeyNote note={note} origin={origin} />);

    // Check article structure
    const article = screen.getByRole("article");
    expect(article).toBeInTheDocument();
    expect(article).toHaveClass(
      "flex",
      "gap-3",
      "border-b",
      "p-3",
      "hover:bg-muted/50",
    );

    // Check avatar
    const avatar = screen.getByTestId("avatar");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass("size-10", "bg-slate-500");

    const avatarImage = screen.getByTestId("avatar-image");
    expect(avatarImage).toHaveAttribute("src", note.user.avatarUrl);

    // Check username text
    const usernameElement = screen.getByText("@testuser");
    expect(usernameElement).toBeInTheDocument();
    expect(usernameElement).toHaveClass("text-muted-foreground");
  });

  it("should render smaller avatar for pure renotes", () => {
    const renoteTarget = createMockNote({
      id: "origin-note",
      text: "Original note text",
    });
    const note = createMockNote({
      text: null,
      renoteId: renoteTarget.id,
      renote: renoteTarget,
      replyId: null,
      cw: null,
      fileIds: [],
      poll: null,
    });
    const origin = "misskey.example.com";

    render(<MisskeyNote note={note} origin={origin} />);

    const avatars = screen.getAllByTestId("avatar");
    expect(avatars[0]).toHaveClass("size-5");
    expect(avatars[0]).not.toHaveClass("size-10");
    expect(avatars[1]).toHaveClass("size-10");
  });

  it("should combine and proxy emoji URLs", () => {
    const note = createMockNote({
      emojis: { smile: "https://example.com/smile.png" },
      user: {
        ...createMockNote().user,
        emojis: { heart: "https://example.com/heart.png" },
      },
    });
    const origin = "misskey.example.com";

    render(<MisskeyNote note={note} origin={origin} />);

    const emojiContext = screen.getByTestId("emoji-context");
    const contextValue = JSON.parse(
      emojiContext.getAttribute("data-value") || "{}",
    );

    expect(contextValue.host).toBe(origin);
    expect(contextValue.emojis).toEqual({
      smile:
        "https://misskey.example.com/proxy/emoji.webp?url=https%3A%2F%2Fexample.com%2Fsmile.png&emoji=1",
      heart:
        "https://misskey.example.com/proxy/emoji.webp?url=https%3A%2F%2Fexample.com%2Fheart.png&emoji=1",
    });
  });

  it("should render user information correctly", () => {
    const note = createMockNote({
      user: {
        ...createMockNote().user,
        name: "Custom Name",
        username: "customuser",
      },
    });
    const origin = "misskey.example.com";

    render(<MisskeyNote note={note} origin={origin} />);

    // Check if MfmText is rendered with user name
    const mfmTexts = screen.getAllByTestId("mfm-text");
    const userNameMfm = mfmTexts.find(
      (el) =>
        el.querySelector('[data-testid="mfm-text-content"]')?.textContent ===
        "Custom Name",
    );
    expect(userNameMfm).toBeInTheDocument();

    // Check username display
    const usernameElement = screen.getByText("@customuser");
    expect(usernameElement).toBeInTheDocument();
    expect(usernameElement).toHaveClass("text-muted-foreground");
  });

  it("should show a link for nested renotes instead of rendering deeper previews", () => {
    const origin = "misskey.example.com";
    const originalNote = createMockNote({
      id: "original-note",
      text: "Original nested note",
    });
    const firstRenote = createMockNote({
      id: "first-renote",
      text: "First renote text",
      renote: originalNote,
    });
    const doubleRenote = createMockNote({
      id: "double-renote",
      text: "Double renote text",
      renote: firstRenote,
    });

    render(<MisskeyNote note={doubleRenote} origin={origin} />);

    const renoteLink = screen.getByRole("link", {
      name: "@testuserのノートを見る",
    });

    expect(renoteLink).toHaveAttribute(
      "href",
      "https://misskey.example.com/notes/original-note",
    );

    const textContents = screen
      .getAllByTestId("mfm-text-content")
      .map((element) => element?.textContent);

    expect(textContents).toContain("First renote text");
    expect(textContents).not.toContain("Original nested note");
  });

  it("should render note text with MfmText", () => {
    const note = createMockNote({
      text: "Hello world :smile: test",
    });
    const origin = "misskey.example.com";

    render(<MisskeyNote note={note} origin={origin} />);

    const mfmTexts = screen.getAllByTestId("mfm-text");
    const noteTextMfm = mfmTexts.find(
      (el) =>
        el.querySelector('[data-testid="mfm-text-content"]')?.textContent ===
        "Hello world :smile: test",
    );
    expect(noteTextMfm).toBeInTheDocument();
  });

  it("should handle note without text", () => {
    const note = createMockNote({
      text: null,
    });
    const origin = "misskey.example.com";

    render(<MisskeyNote note={note} origin={origin} />);

    const article = screen.getByRole("article");
    expect(article).toBeInTheDocument();

    // Should not render note text MfmText
    const mfmTexts = screen.getAllByTestId("mfm-text");
    const noteTextMfm = mfmTexts.find(
      (el) =>
        el.querySelector('[data-testid="mfm-text-content"]')?.textContent ===
        null,
    );
    expect(noteTextMfm).toBeUndefined();
  });

  it("should render file attachments", () => {
    const note = createMockNote({
      files: [
        {
          id: "file1",
          createdAt: "2023-01-01T00:00:00.000Z",
          url: "https://example.com/image1.jpg",
          name: "image1.jpg",
          type: "image/jpeg",
          md5: "abc123",
          size: 1024,
          isSensitive: false,
          blurhash: null,
          properties: {
            width: 800,
            height: 600,
          },
          comment: null,
          thumbnailUrl: null,
          folderId: null,
          userId: null,
          user: null,
        },
        {
          id: "file2",
          createdAt: "2023-01-01T00:00:00.000Z",
          url: "https://example.com/image2.jpg",
          name: "image2.jpg",
          type: "image/jpeg",
          md5: "def456",
          size: 2048,
          isSensitive: false,
          blurhash: null,
          properties: {
            width: 1024,
            height: 768,
          },
          comment: null,
          thumbnailUrl: null,
          folderId: null,
          userId: null,
          user: null,
        },
      ],
    });
    const origin = "misskey.example.com";

    render(<MisskeyNote note={note} origin={origin} />);

    const images = screen.getAllByAltText("Note Attachment");
    expect(images).toHaveLength(2);

    expect(images[0]).toHaveAttribute("src", "https://example.com/image1.jpg");
    expect(images[1]).toHaveAttribute("src", "https://example.com/image2.jpg");

    images.forEach((img) => {
      expect(img).toHaveClass(
        "mt-2",
        "h-auto",
        "max-w-full",
        "rounded-md",
        "border",
      );
    });
  });

  it("should handle empty origin", () => {
    const note = createMockNote();
    const origin = "";

    render(<MisskeyNote note={note} origin={origin} />);

    const emojiContext = screen.getByTestId("emoji-context");
    const contextValue = JSON.parse(
      emojiContext.getAttribute("data-value") || "{}",
    );

    expect(contextValue.host).toBe("");
  });

  it("should fallback to username when name is not available", () => {
    const note = createMockNote({
      user: {
        ...createMockNote().user,
        name: null,
        username: "testuser",
      },
    });
    const origin = "misskey.example.com";

    render(<MisskeyNote note={note} origin={origin} />);

    const mfmTexts = screen.getAllByTestId("mfm-text");
    const userNameMfm = mfmTexts.find(
      (el) =>
        el.querySelector('[data-testid="mfm-text-content"]')?.textContent ===
        "testuser",
    );
    expect(userNameMfm).toBeInTheDocument();
  });

  it("should handle missing avatar URL", () => {
    const note = createMockNote({
      user: {
        ...createMockNote().user,
        avatarUrl: "",
      },
    });
    const origin = "misskey.example.com";

    render(<MisskeyNote note={note} origin={origin} />);

    const avatarImage = screen.getByTestId("avatar-image");
    expect(avatarImage).not.toHaveAttribute("src");
  });

  describe("Long Text Handling", () => {
    it("should handle very long single line text without horizontal scroll", () => {
      const longText = "A".repeat(1000);
      const note = createMockNote({ text: longText });
      const origin = "misskey.example.com";

      render(<MisskeyNote note={note} origin={origin} />);

      const article = screen.getByRole("article");
      expect(article).toBeInTheDocument();

      // Check that MfmText is rendered with the long text
      const mfmTexts = screen.getAllByTestId("mfm-text");
      const longTextMfm = mfmTexts.find(
        (el) =>
          el.querySelector('[data-testid="mfm-text-content"]')?.textContent ===
          longText,
      );
      expect(longTextMfm).toBeInTheDocument();
    });

    it("should handle long URLs properly", () => {
      const longUrl = "https://example.com/" + "very-long-path/".repeat(20);
      const note = createMockNote({ text: longUrl });
      const origin = "misskey.example.com";

      render(<MisskeyNote note={note} origin={origin} />);

      const mfmTexts = screen.getAllByTestId("mfm-text");
      const urlTextMfm = mfmTexts.find(
        (el) =>
          el.querySelector('[data-testid="mfm-text-content"]')?.textContent ===
          longUrl,
      );
      expect(urlTextMfm).toBeInTheDocument();
    });

    it("should render text content with appropriate word-break classes", () => {
      const longText = "VeryLongWordWithoutSpaces".repeat(50);
      const note = createMockNote({ text: longText });
      const origin = "misskey.example.com";

      render(<MisskeyNote note={note} origin={origin} />);

      // Verify that the note text is rendered correctly
      const mfmTexts = screen.getAllByTestId("mfm-text");
      const noteTextMfm = mfmTexts.find(
        (el) =>
          el.querySelector('[data-testid="mfm-text-content"]')?.textContent ===
          longText,
      );
      expect(noteTextMfm).toBeInTheDocument();
    });

    it("should render Japanese text without horizontal overflow", () => {
      const mixedText = "こんにちは世界";
      const note = createMockNote({ text: mixedText });
      const origin = "misskey.example.com";

      render(<MisskeyNote note={note} origin={origin} />);

      const mfmTexts = screen.getAllByTestId("mfm-text");
      const mixedTextMfm = mfmTexts.find(
        (el) =>
          el.querySelector('[data-testid="mfm-text-content"]')?.textContent ===
          mixedText,
      );
      expect(mixedTextMfm).toBeInTheDocument();
    });
  });
});
