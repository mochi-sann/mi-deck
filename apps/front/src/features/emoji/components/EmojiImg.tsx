interface EmojiImgProps {
  name: string;
  url?: string | null;
}

export const EmojiImg = ({ name, url }: EmojiImgProps) =>
  !url ? (
    `:${name}:`
  ) : (
    <img
      src={url}
      alt={name}
      className="mfm-customEmoji inline h-[1.2em] w-auto"
    />
  );
