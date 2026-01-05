import { APIClient } from "misskey-js/api.js";
import { UserDetailed } from "misskey-js/entities.js";
import {
  type InferOutput,
  nullable,
  number,
  object,
  optional,
  parse,
  record,
  string,
} from "valibot";

const UserDetailedSchema = object({
  id: string(),
  username: string(),
  name: optional(nullable(string())),
  host: optional(nullable(string())),
  bannerUrl: optional(nullable(string())),
  avatarUrl: optional(nullable(string())),
  description: optional(nullable(string())),
  emojis: optional(record(string(), string())),
  followingCount: number(),
  followersCount: number(),
  notesCount: number(),
});
type UserDetailedSchemaOutput = InferOutput<typeof UserDetailedSchema>;

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
    return parse(UserDetailedSchema, response) as UserDetailedSchemaOutput;
  }
}
