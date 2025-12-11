import { render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock(
  "@/features/compose-dialog/components/StandardNoteComposerDialog",
  () => ({
    // biome-ignore lint/style/useNamingConvention: ignore
    StandardNoteComposerDialog: vi.fn((props: { mode: string }) => (
      <div data-testid="standard">standard-{props.mode}</div>
    )),
  }),
);

vi.mock("./RenoteDialogWrapper", () => ({
  // biome-ignore lint/style/useNamingConvention: ignore
  RenoteDialogWrapper: vi.fn((props: { mode: string }) => (
    <div data-testid="renote">renote-{props.mode}</div>
  )),
}));

let NoteComposerDialog: (typeof import("@/features/compose-dialog/components/NoteComposerDialog"))["NoteComposerDialog"];
let StandardNoteComposerDialog: (typeof import("@/features/compose-dialog/components/StandardNoteComposerDialog"))["StandardNoteComposerDialog"];
let RenoteDialogWrapper: (typeof import("./RenoteDialogWrapper"))["RenoteDialogWrapper"];

beforeAll(async () => {
  ({ NoteComposerDialog } =
    await import("@/features/compose-dialog/components/NoteComposerDialog"));
  ({ StandardNoteComposerDialog } =
    await import("@/features/compose-dialog/components/StandardNoteComposerDialog"));
  ({ RenoteDialogWrapper } = await import("./RenoteDialogWrapper"));
});

describe("NoteComposerDialog router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders StandardNoteComposerDialog for non-renote modes", () => {
    render(<NoteComposerDialog mode="create" />);

    expect(screen.getByTestId("standard")).toHaveTextContent("standard-create");
    expect(StandardNoteComposerDialog).toHaveBeenCalled();
    expect(RenoteDialogWrapper).not.toHaveBeenCalled();
  });

  it("renders RenoteDialogWrapper when mode is renote", () => {
    render(<NoteComposerDialog mode="renote" />);

    expect(screen.getByTestId("renote")).toHaveTextContent("renote-renote");
    expect(RenoteDialogWrapper).toHaveBeenCalled();
    expect(StandardNoteComposerDialog).not.toHaveBeenCalled();
  });
});
