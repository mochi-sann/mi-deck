import type { FC } from "hono/jsx";
import { OpenUrl } from "../lib/openUrl";

const misskeyPremission = [
  "read:account",
  "write:account",
  "read:blocks",
  "write:blocks",
  "read:drive",
  "write:drive",
  "read:favorites",
  "write:favorites",
  "read:following",
  "write:following",
  "read:messaging",
  "write:messaging",
  "read:mutes",
  "write:mutes",
  "write:notes",
  "read:notifications",
  "write:notifications",
  "read:reactions",
  "write:reactions",
  "write:votes",
  "read:pages",
  "write:pages",
  "write:page-likes",
  "read:page-likes",
  "read:user-groups",
  "write:user-groups",
  "read:channels",
  "write:channels",
  "read:gallery",
  "write:gallery",
  "read:gallery-likes",
  "write:gallery-likes",
  "read:flash",
  "write:flash",
  "read:flash-likes",
  "write:flash-likes",
  "write:invite-codes",
  "read:invite-codes",
  "write:clip-favorite",
  "read:clip-favorite",
  "read:federation",
  "write:report-abuse",
];

export const MiAuth: FC = () => {
  const misskey_url = new URL(
    "https://misskey.mochi33.com/miauth/31f6d42b-468b-4fd2-8274-e58abdedef6f?name=mi-deck&permission=read:account,write:notes",
  );

  const handleClick = () => {
    console.log(...[misskey_url, "👀 [MiAuth.tsx:55]: misskey_url"].reverse());
    OpenUrl(misskey_url.toString());
  };
  return (
    <div>
      <button onClick={handleClick}>login</button>
    </div>
  );
};
