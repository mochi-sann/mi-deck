import { permissions } from "misskey-js";

export const GenMiAuthUrl = (origin: string) => {
  const param = {
    name: "mi-desk-app",
    permission: permissions,
  };
  const newUuid = crypto.randomUUID();
  const MiauthUrl = `${origin}/miauth/${newUuid}?name=${
    param.name
  }&permission=${param.permission.join(",")}`;
  return { url: MiauthUrl, uuid: newUuid };
};
export const MiAuthReq = async (origin: string) => {
  const { url, uuid } = GenMiAuthUrl(origin);
  window.open(url, "_blank");
  return uuid;
};

export class MiAuth {}
