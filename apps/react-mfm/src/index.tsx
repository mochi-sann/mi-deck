"use client"; // wtf

import { atom, useAtom, useAtomValue } from "jotai";
import { type MfmNode, parse, parseSimple } from "mfm-js";
import { type FC } from "react";
import { type CustomEmojiProps } from "./components/CustomEmoji";
import { type HashtagProps } from "./components/Hashtag";
import { type LinkProps } from "./components/Link";
import { type MentionProps } from "./components/Mention";
import Node from "./Node";

////////////////////////////////////////////////////////////////

// for internal use
export type MfmBasicProps = {
  plain?: boolean;
  nowrap?: boolean;
  nyaize?: boolean | "respect";
  host?: string;
  emojis?: { [key: string]: string } | undefined;
};

const MfmBase =
  (parser: (input: string) => MfmNode[]) =>
  ({ text, ...props }: MfmBasicProps & { text: string }) => (
    <Node nodes={parser(text)} {...props} />
  );

export const Mfm = MfmBase(parse);
export const MfmSimple = MfmBase(parseSimple);

export default Mfm;

////////////////////////////////////////////////////////////////

export type { CustomEmojiProps, HashtagProps, MentionProps };

export type MfmConfig = Partial<{
  // mfm
  advanced: boolean; // default: true
  animation: boolean; // default: true

  // components
  // biome-ignore lint/style/useNamingConvention: mfm-jsの仕様に合わせるため
  CustomEmoji: FC<CustomEmojiProps>;
  // biome-ignore lint/style/useNamingConvention: mfm-jsの仕様に合わせるため
  Hashtag: FC<HashtagProps>;
  // biome-ignore lint/style/useNamingConvention: mfm-jsの仕様に合わせるため
  Link: FC<LinkProps>;
  // biome-ignore lint/style/useNamingConvention: mfm-jsの仕様に合わせるため
  Mention: FC<MentionProps>;
}>;

export const mfmConfigAtom = atom<MfmConfig>({});
export const useMfmConfig = () => useAtom(mfmConfigAtom);
export const useMfmConfigValue = () => useAtomValue(mfmConfigAtom);
