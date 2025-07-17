import { APIClient } from "misskey-js/api.js";
import { Note } from "misskey-js/entities.js";
import { UserList } from "../hooks/useUserLists";

export class ListApi {
  private client: APIClient;

  constructor(origin: string, token: string) {
    this.client = new APIClient({
      origin,
      credential: token,
    });
  }

  async getUserLists(): Promise<UserList[]> {
    // biome-ignore lint/suspicious/noExplicitAny: Misskey API client type
    const response = await (this.client as any).request("users/lists/list", {});
    return response as UserList[];
  }

  async getListTimeline(listId: string, untilId?: string): Promise<Note[]> {
    const params = {
      listId,
      ...(untilId ? { untilId } : {}),
    };

    // biome-ignore lint/suspicious/noExplicitAny: Misskey API client type
    const response = await (this.client as any).request(
      "notes/user-list-timeline",
      params,
    );
    return response as Note[];
  }

  async createList(name: string, isPublic = false): Promise<UserList> {
    // biome-ignore lint/suspicious/noExplicitAny: Misskey API client type
    const response = await (this.client as any).request("users/lists/create", {
      name,
      isPublic,
    });
    return response as UserList;
  }

  async deleteList(listId: string): Promise<void> {
    // biome-ignore lint/suspicious/noExplicitAny: Misskey API client type
    await (this.client as any).request("users/lists/delete", {
      listId,
    });
  }

  async updateList(
    listId: string,
    name: string,
    isPublic?: boolean,
  ): Promise<UserList> {
    const params = {
      listId,
      name,
      ...(isPublic !== undefined ? { isPublic } : {}),
    };

    // biome-ignore lint/suspicious/noExplicitAny: Misskey API client type
    const response = await (this.client as any).request(
      "users/lists/update",
      params,
    );
    return response as UserList;
  }

  async addUserToList(listId: string, userId: string): Promise<void> {
    // biome-ignore lint/suspicious/noExplicitAny: Misskey API client type
    await (this.client as any).request("users/lists/push", {
      listId,
      userId,
    });
  }

  async removeUserFromList(listId: string, userId: string): Promise<void> {
    // biome-ignore lint/suspicious/noExplicitAny: Misskey API client type
    await (this.client as any).request("users/lists/pull", {
      listId,
      userId,
    });
  }
}
