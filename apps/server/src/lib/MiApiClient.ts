import { APIClient } from "misskey-js/api.js";

export function getMiApiClient(origin: string, credential: string): APIClient {
  const client = new APIClient({
    origin: origin,
    credential: credential,
  });
  return client;
}
