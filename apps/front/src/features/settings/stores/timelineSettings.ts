import { atomWithStorage } from "jotai/utils";

export type NsfwBehavior = "show" | "blur" | "hide";

export interface TimelineSettings {
  nsfwBehavior: NsfwBehavior;
}

export const timelineSettingsAtom = atomWithStorage<TimelineSettings>(
  "timeline-settings",
  {
    nsfwBehavior: "blur",
  },
);
