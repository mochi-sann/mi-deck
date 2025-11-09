import { render, screen } from "@testing-library/react";
import type { Note } from "misskey-js/entities.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RenoteMenu } from "./RenoteMenu";

const mockUseRenoteAction = vi.fn();

vi.mock("@/features/notes/actions/useRenoteAction", () => ({
  useRenoteAction: (args: unknown) => mockUseRenoteAction(args),
}));

vi.mock("@/features/notes/components/NoteComposerDialog", () => ({
  // biome-ignore lint/style/useNamingConvention: 実際のエクスポート名に合わせてPascalCaseを維持
  NoteComposerDialog: ({ trigger }: { trigger?: JSX.Element }) =>
    trigger ?? null,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const note: Note = {
  id: "note-1",
  text: "Sample note",
  createdAt: "2024-01-01T00:00:00.000Z",
  renoteCount: 5,
  user: {
    id: "user-1",
    username: "tester",
    name: "Tester",
    host: "misskey.example",
  },
  emojis: {},
  files: [],
} as Note;

describe("RenoteMenu", () => {
  beforeEach(() => {
    mockUseRenoteAction.mockReturnValue({
      renoteCount: 5,
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
      toggleRenote: vi.fn(),
    });
  });

  it("renders renote button with count", () => {
    render(<RenoteMenu note={note} origin="https://misskey.example" />);

    expect(
      screen.getByRole("button", { name: "renote.button.default" }),
    ).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("marks button as pressed when renoted", () => {
    mockUseRenoteAction.mockReturnValueOnce({
      renoteCount: 6,
      isRenoted: true,
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
      toggleRenote: vi.fn(),
    });

    render(<RenoteMenu note={note} origin="https://misskey.example" />);
    expect(
      screen.getByRole("button", { name: "renote.button.active" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
