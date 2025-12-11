import { type MfmEmojiCode } from "mfm-js";
import { createContext, Fragment, useContext } from "react";
import { useMfmConfigValue } from "..";

export type CustomEmojiProps = MfmEmojiCode["props"] & {
  host?: string;
  emojis?: { [key: string]: string } | undefined;
};

const EmojiImg = ({ name, url }: { name: string; url?: string | null }) =>
  !url ? `:${name}:` : <img src={url} alt={name} className="mfm-customEmoji" />;

export const CustomEmojiCtx = createContext<{
  host: string | null;
  emojis?: { [key: string]: string } | undefined;
}>({
  host: null,
});

function CustomEmojiInternal({ name }: CustomEmojiProps) {
  const { emojis } = useContext(CustomEmojiCtx);

  // Only use emoji data provided via props/context
  const emojiUrl = emojis?.[name];
  return <EmojiImg name={name} url={emojiUrl} />;
}

export default function CustomEmoji(props: CustomEmojiProps) {
  const { CustomEmoji } = useMfmConfigValue();

  if (CustomEmoji) {
    return CustomEmoji(props);
  }

  if (props.host || props.emojis) {
    return (
      <CustomEmojiCtx.Provider
        value={{
          host: props.host || null,
          emojis: props.emojis,
        }}
      >
        <CustomEmojiInternal {...props} />
      </CustomEmojiCtx.Provider>
    );
  }

  return <CustomEmojiInternal {...props} />;
}

export const CustomEmojiStr = ({ text }: { text: string }) =>
  text
    .split(":")
    .map((s, i) =>
      i % 2 ? (
        <CustomEmojiInternal name={s} key={i} />
      ) : (
        <Fragment key={i}>{s}</Fragment>
      ),
    );
