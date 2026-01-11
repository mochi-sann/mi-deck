import { atomWithStorage } from "jotai/utils";

export type NsfwBehavior = "show" | "blur" | "hide";

export interface TimelineSettings {
  nsfwBehavior: NsfwBehavior;
  noteContentMaxHeight: number | null;
}

export const timelineSettingsAtom = atomWithStorage<TimelineSettings>(
  "timeline-settings",
  {
    nsfwBehavior: "blur",
    noteContentMaxHeight: 320,
  },
);
