import { permissions } from "misskey-js";

export const GenMiAuthUrl = (origin: string) => {
  const param = {
    name: "mi-desk-app-test",
    permission: permissions,
  };
  //今のURLを取得
  const currentOrigin = window.location.origin;
  const callbackUrl = `${currentOrigin}/add-server/fallback/${origin}`;
  const encodeCallbackUrl = encodeURIComponent(callbackUrl);

  const newUuid = crypto.randomUUID();
  const MiauthUrl = `https://${origin}/miauth/${newUuid}?name=${
    param.name
  }&permission=${param.permission.join(",")}&callback=${encodeCallbackUrl}`;
  return { url: MiauthUrl, uuid: newUuid };
};

export const MiAuthReq = async (origin: string) => {
  const { url, uuid } = GenMiAuthUrl(origin);
  try {
    window.open(url, "_blank");
  } catch (error) {
    console.error("Failed to open auth window:", error);
    // エラーが発生してもUUIDは返す
  }
  return uuid;
};

export class MiAuth {}
