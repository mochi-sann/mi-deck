import { atom, useAtom, useAtomValue } from "jotai";
import { type MfmEmojiCode } from "mfm-js";
import { createContext, Fragment, Suspense, use, useContext } from "react";
import { useMfmConfigValue } from "..";
import {
  emojiCacheAtom,
  updateEmojiCacheAtom,
} from "../database/emoji-cache-database";
import { toUrl } from "../utils";

export type CustomEmojiProps = MfmEmojiCode["props"] & {
  host?: string;
  emojis?: { [key: string]: string } | undefined;
};

const emojiFetchAtom = atom<{ [id: string]: Promise<string | null> }>({});

// Simple foreign API hook for emoji fetching
function useForeignApi(host: string) {
  if (!host) return null;

  return {
    emojiUrl: async (name: string): Promise<string | null> => {
      try {
        const response = await fetch(`${toUrl(host)}/api/emoji?name=${name}`);
        const data = await response.json();
        return data.url || null;
      } catch (error) {
        console.warn("Failed to fetch emoji:", error);
        return null;
      }
    },
  };
}

// internal

const EmojiImg = ({ name, url }: { name: string; url?: string | null }) =>
  !url ? `:${name}:` : <img src={url} alt={name} className="mfm-customEmoji" />;

function FetchEmoji({ name, host }: { name: string; host: string }) {
  const api = useForeignApi(host);
  const cache = useAtomValue(emojiCacheAtom);
  const [, updateCache] = useAtom(updateEmojiCacheAtom);
  const [fetches, setFetches] = useAtom(emojiFetchAtom);

  const key = name + "@" + host;

  const Cached = () => <EmojiImg name={name} url={cache[host]?.[name]} />;
  if (host in cache && name in cache[host]) return <Cached />;
  if (!api) return <Cached />;

  if (key in fetches) {
    const url = use(fetches[key]);
    updateCache({ host, cache: { [name]: url } });
    delete fetches[key];
    setFetches({ ...fetches });
    return <EmojiImg name={name} url={url} />;
  }

  const task = api.emojiUrl(name);
  setFetches({ ...fetches, [key]: task });
  return <EmojiImg name={name} url={use(task)} />;
}

// Components

export const CustomEmojiCtx = createContext<{
  host: string | null;
  emojis?: { [key: string]: string } | undefined;
}>({
  host: null,
});

function CustomEmojiInternal({ name }: CustomEmojiProps) {
  const cache = useAtomValue(emojiCacheAtom);
  const { host, emojis } = useContext(CustomEmojiCtx);

  // First check local emoji data
  const localEmojiUrl = emojis?.[name];

  if (localEmojiUrl) {
    return <EmojiImg name={name} url={localEmojiUrl} />;
  }

  if (!host) return <EmojiImg name={name} />;
  return (
    <Suspense fallback={<EmojiImg name={name} url={cache[host]?.[name]} />}>
      <FetchEmoji name={name} host={host} />
    </Suspense>
  );
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
  text.split(":").map((s, i) =>
    i % 2 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: mfm-jsの仕様に合わせるため
      <CustomEmojiInternal name={s} key={i} />
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: mfm-jsの仕様に合わせるため
      <Fragment key={i}>{s}</Fragment>
    ),
  );
