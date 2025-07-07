"use client";

import { atom, useAtom, useAtomValue } from "jotai";
import { type MfmEmojiCode } from "mfm-js";
import { Suspense, use, useEffect } from "react";
import { useMfmConfigValue } from "..";
import { toUrl } from "../utils";

export type CustomEmojiProps = MfmEmojiCode["props"] & {
  host?: string;
};

const cacheAtom = atom<{ [key: string]: string | undefined }>({});
const cachedHostAtom = atom<string | undefined>(undefined);
const promiseAtom = atom<{ [key: string]: Promise<any> }>({});

const EmojiImg = ({ name, url }: { name: string; url?: string }) =>
  !url ? `:${name}:` : <img src={url} alt={name} className="mfm-customEmoji" />;

function CustomEmojiInternal({ name, host }: CustomEmojiProps) {
  const cache = useAtomValue(cacheAtom);
  return (
    <Suspense fallback={<EmojiImg name={name} url={cache[name]} />}>
      <FetchEmoji name={name} host={host} />
    </Suspense>
  );
}

function FetchEmoji({ name, host }: { name: string; host?: string }) {
  const [cache, setCache] = useAtom(cacheAtom);
  const [cachedHost, setCachedHost] = useAtom(cachedHostAtom);
  const [promises, setPromises] = useAtom(promiseAtom);

  useEffect(() => {
    if (host !== cachedHost) {
      setCache({});
      setCachedHost(host);
      setPromises({});
    }
  }, [host, cachedHost, setCache, setCachedHost, setPromises]);

  if (!host || host !== cachedHost) {
    return <EmojiImg name={name} />;
  }

  // Create a cache key for this specific emoji
  const cacheKey = `${host}:${name}`;

  // If we already have the result cached, return it
  if (cacheKey in cache) {
    return <EmojiImg name={name} url={cache[cacheKey]} />;
  }

  // If we don't have a promise for this emoji yet, create one
  if (!(cacheKey in promises)) {
    const promise = fetch(`${toUrl(host)}/api/emoji?name=${name}`)
      .then((res) => res.json())
      .then((data) => {
        setCache((prevCache) => ({ ...prevCache, [cacheKey]: data.url }));
        return data;
      })
      .catch((e) => {
        console.warn(e);
        setCache((prevCache) => ({ ...prevCache, [cacheKey]: undefined }));
        return {};
      });

    setPromises((prevPromises) => ({ ...prevPromises, [cacheKey]: promise }));
  }

  // Use the promise
  const response = use(promises[cacheKey]);

  return <EmojiImg name={name} url={response?.url} />;
}

export default function CustomEmoji(props: CustomEmojiProps) {
  const { CustomEmoji } = useMfmConfigValue();

  if (CustomEmoji) {
    return CustomEmoji(props);
  }

  if (props.host) {
    return <CustomEmojiInternal {...props} />;
  }

  return `:${props.name}:`;
}
