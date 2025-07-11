import { useAtom, useAtomValue } from "jotai";
import { use } from "react";
import { useForeignApi } from "@/hooks/useForeignApi";
import { emojiFetchAtom } from "@/lib/atoms/emoji-fetch";
import {
  emojiCacheAtom,
  updateEmojiCacheAtom,
} from "@/lib/database/emoji-cache-database";
import { EmojiImg } from "./EmojiImg";

interface FetchEmojiProps {
  name: string;
  host: string;
}

export function FetchEmoji({ name, host }: FetchEmojiProps) {
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
    const newFetches = { ...fetches };
    delete newFetches[key];
    setFetches(newFetches);
    return <EmojiImg name={name} url={url} />;
  }

  const task = api.emojiUrl(name);
  setFetches({ ...fetches, [key]: task });
  return <EmojiImg name={name} url={use(task)} />;
}
