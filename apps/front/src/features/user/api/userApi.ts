import { APIClient } from "misskey-js/api.js";
import { UserDetailed } from "misskey-js/entities.js";

export class UserApi {
  private client: APIClient;

  constructor(origin: string, token: string) {
    this.client = new APIClient({
      origin,
      credential: token,
    });
  }

  async getUser(userId: string): Promise<UserDetailed> {
    const response = await this.client.request("users/show", {
      userId,
    });
    return response as UserDetailed;
  }
}
