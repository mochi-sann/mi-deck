import { render, screen } from "@testing-library/react";
import type { Note } from "misskey-js/entities.js";
import { describe, expect, it, vi } from "vitest";
import { MisskeyNote } from "./MisskeyNote";

// Mock dependencies
vi.mock("@/features/emoji", () => ({
  // biome-ignore lint/style/useNamingConvention: テストで必須
  CustomEmojiCtx: {
    // biome-ignore lint/style/useNamingConvention: テストで必須
    Provider: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      // biome-ignore lint/suspicious/noExplicitAny: テストで必須
      value: any;
    }) => (
      <div data-testid="emoji-context" data-value={JSON.stringify(value)}>
        {children}
      </div>
    ),
  },
}));

vi.mock("@/features/mfm", () => ({
  // biome-ignore lint/style/useNamingConvention: テストで必須
  MfmText: ({
    text,
    host,
    emojis,
  }: {
    text: string;
    host: string;
    // biome-ignore lint/suspicious/noExplicitAny: テストで必須
    emojis: any;
  }) => (
    <div data-testid="mfm-text">
      <span data-testid="mfm-text-content">{text}</span>
      <span data-testid="mfm-host">{host}</span>
      <span data-testid="mfm-emojis">{JSON.stringify(emojis)}</span>
    </div>
  ),
}));

vi.mock("@/lib/utils/emoji-proxy", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: テストで必須
  createProxiedEmojis: (emojis: any, host: string) => {
    if (!emojis || !host) return emojis;
    // biome-ignore lint/suspicious/noExplicitAny: テストで必須
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
  // biome-ignore lint/style/useNamingConvention: テストで必須
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
  // biome-ignore lint/style/useNamingConvention: テストで必須
  AvatarImage: ({ src }: { src: string | null }) => {
    const imgProps = src ? { src } : {};
    return <img data-testid="avatar-image" {...imgProps} alt="avatar" />;
  },
  // biome-ignore lint/style/useNamingConvention: テストで必須
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
        // biome-ignore lint/style/useNamingConvention: テストで必須
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
    expect(avatar).toHaveClass("h-10", "w-10", "bg-slate-900");

    const avatarImage = screen.getByTestId("avatar-image");
    expect(avatarImage).toHaveAttribute("src", note.user.avatarUrl);

    // Check username text
    const usernameElement = screen.getByText("@testuser");
    expect(usernameElement).toBeInTheDocument();
    expect(usernameElement).toHaveClass("text-muted-foreground");
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
