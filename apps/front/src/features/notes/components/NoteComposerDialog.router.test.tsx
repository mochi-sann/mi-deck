import { render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./StandardNoteComposerDialog", () => ({
  StandardNoteComposerDialog: vi.fn((props: { mode: string }) => (
    <div data-testid="standard">standard-{props.mode}</div>
  )),
}));

vi.mock("./RenoteDialogWrapper", () => ({
  RenoteDialogWrapper: vi.fn((props: { mode: string }) => (
    <div data-testid="renote">renote-{props.mode}</div>
  )),
}));

let NoteComposerDialog: (typeof import("./NoteComposerDialog"))[
  "NoteComposerDialog"
];
let StandardNoteComposerDialog: (typeof import("./StandardNoteComposerDialog"))[
  "StandardNoteComposerDialog"
];
let RenoteDialogWrapper: (typeof import("./RenoteDialogWrapper"))["RenoteDialogWrapper"];

beforeAll(async () => {
  ({ NoteComposerDialog } = await import("./NoteComposerDialog"));
  ({ StandardNoteComposerDialog } = await import("./StandardNoteComposerDialog"));
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
