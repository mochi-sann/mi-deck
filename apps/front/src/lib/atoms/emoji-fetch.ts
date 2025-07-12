import { atom } from "jotai";

export const emojiFetchAtom = atom<{ [id: string]: Promise<string | null> }>(
  {},
);
