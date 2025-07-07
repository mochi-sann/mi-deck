"use client";

import { type MfmEmojiCode } from "mfm-js";
import { Suspense, use, useEffect, useState } from "react";
import { useMfmConfigValue } from "..";

export type CustomEmojiProps = MfmEmojiCode["props"] & {
  host?: string;
};

const EmojiImg = ({ name, url }: { name: string; url?: string }) =>
  !url ? `:${name}:` : <img src={url} alt={name} className="mfm-customEmoji" />;

const DummyCustomEmoji = ({ name }: CustomEmojiProps) => `:${name}:`;

function FetchEmoji({ name, host }: CustomEmojiProps) {
  const [cache, setCache] = useState<{ [key: string]: string }>({});
  const [cachedHost, setCachedHost] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (host !== cachedHost) {
      setCache({});
      setCachedHost(host);
    }
  }, [host, cachedHost]);

  if (name in cache && host === cachedHost) {
    return <EmojiImg name={name} url={cache[name]} />;
  }

  if (!host || host !== cachedHost) {
    return <EmojiImg name={name} />;
  }

  const hostUrl = host.startsWith("http") ? host : `https://${host}`;
  const { url } = use(
    fetch(`${hostUrl}/api/emoji?name=${name}`)
      .then((res) => res.json())
      .catch((e) => (console.warn(e), {})),
  );

  setCache((prev) => ({ ...prev, [name]: url }));
  return <EmojiImg name={name} url={url} />;
}

export default function CustomEmoji(props: CustomEmojiProps) {
  const { CustomEmoji } = useMfmConfigValue();

  if (CustomEmoji) {
    return CustomEmoji(props);
  }

  if (props.host) {
    return (
      <Suspense fallback={<EmojiImg name={props.name} />}>
        <FetchEmoji {...props} />
      </Suspense>
    );
  }

  return DummyCustomEmoji(props);
}
