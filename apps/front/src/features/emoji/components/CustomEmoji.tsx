import { type MfmEmojiCode } from "mfm-js";
import { createContext, Fragment, useContext } from "react";

export type CustomEmojiProps = MfmEmojiCode["props"] & {
  host?: string;
  emojis?: { [key: string]: string } | undefined;
};

// internal

const EmojiImg = ({ name, url }: { name: string; url?: string | null }) =>
  !url ? `:${name}:` : <img src={url} alt={name} className="mfm-customEmoji" />;

// Components

export const CustomEmojiCtx = createContext<{
  emojis?: { [key: string]: string } | undefined;
}>({
  emojis: undefined,
});

function CustomEmojiInternal({ name }: CustomEmojiProps) {
  const { emojis } = useContext(CustomEmojiCtx);

  // Only use emoji data from context
  const localEmojiUrl = emojis?.[name];

  return <EmojiImg name={name} url={localEmojiUrl} />;
}

export function CustomEmoji(props: CustomEmojiProps) {
  if (props.emojis) {
    return (
      <CustomEmojiCtx.Provider
        value={{
          emojis: props.emojis,
        }}
      >
        <CustomEmojiInternal {...props} />
      </CustomEmojiCtx.Provider>
    );
  }

  return <CustomEmojiInternal {...props} />;
}

export default CustomEmoji;

export const CustomEmojiStr = ({ text }: { text: string }) =>
  text.split(":").map((s, i) =>
    i % 2 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: mfm-jsの仕様に合わせるため
      <CustomEmojiInternal name={s} key={i} />
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: mfm-jsの仕様に合わせるため
      <Fragment key={i}>{s}</Fragment>
    ),
  );
