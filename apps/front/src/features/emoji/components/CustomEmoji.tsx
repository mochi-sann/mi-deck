import { Fragment } from "react";
import { CustomEmojiCtx } from "../contexts/CustomEmojiContext";
import { CustomEmojiInternal } from "./CustomEmojiInternal";

interface CustomEmojiProps {
  name: string;
  host?: string;
  emojis?: { [key: string]: string };
}

export function CustomEmoji({ name, host, emojis }: CustomEmojiProps) {
  if (host || emojis) {
    return (
      <CustomEmojiCtx.Provider
        value={{
          host: host || null,
          emojis: emojis,
        }}
      >
        <CustomEmojiInternal name={name} host={host || ""} emojis={emojis} />
      </CustomEmojiCtx.Provider>
    );
  }

  return <CustomEmojiInternal name={name} host="" emojis={emojis} />;
}

// String processing component for emojis
export const CustomEmojiStr = ({
  text,
  host,
  emojis,
}: {
  text: string;
  host?: string;
  emojis?: { [key: string]: string };
}) =>
  text.split(":").map((s, i) =>
    i % 2 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: mfm-jsの仕様に合わせるため
      <CustomEmoji name={s} host={host} emojis={emojis} key={i} />
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: mfm-jsの仕様に合わせるため
      <Fragment key={i}>{s}</Fragment>
    ),
  );
