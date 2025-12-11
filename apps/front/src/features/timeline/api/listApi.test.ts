import { APIClient } from "misskey-js/api.js";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { ListApi } from "./listApi";

// Mock misskey-js modules
vi.mock("misskey-js/api.js", () => ({
  APIClient: vi.fn(),
}));

describe("ListApi", () => {
  const mockOrigin = "https://example.com";
  const mockToken = "test-token";
  const mockRequest = vi.fn();

  let listApi: ListApi;

  beforeEach(() => {
    vi.clearAllMocks();
    (APIClient as Mock).mockImplementation(() => ({
      request: mockRequest,
    }));
    listApi = new ListApi(mockOrigin, mockToken);
  });

  it("should initialize with correct configuration", () => {
    expect(APIClient).toHaveBeenCalledWith({
      origin: mockOrigin,
      credential: mockToken,
    });
  });

  describe("getUserLists", () => {
    it("should fetch user lists successfully", async () => {
      const mockLists = [
        {
          id: "list1",
          name: "Test List 1",
          description: "First test list",
          isPublic: false,
          userIds: ["user1", "user2"],
          createdAt: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "list2",
          name: "Test List 2",
          description: "Second test list",
          isPublic: true,
          userIds: ["user3"],
          createdAt: "2023-01-02T00:00:00.000Z",
        },
      ];

      mockRequest.mockResolvedValueOnce(mockLists);

      const result = await listApi.getUserLists();

      expect(mockRequest).toHaveBeenCalledWith("users/lists/list", {});
      expect(result).toEqual(mockLists);
    });

    it("should handle API errors", async () => {
      const mockError = new Error("API Error");
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(listApi.getUserLists()).rejects.toThrow("API Error");
    });
  });

  describe("getListTimeline", () => {
    it("should fetch list timeline successfully", async () => {
      const mockNotes = [
        { id: "note1", text: "Test note 1" },
        { id: "note2", text: "Test note 2" },
      ];
      const listId = "test-list-id";

      mockRequest.mockResolvedValueOnce(mockNotes);

      const result = await listApi.getListTimeline(listId);

      expect(mockRequest).toHaveBeenCalledWith("notes/user-list-timeline", {
        listId,
      });
      expect(result).toEqual(mockNotes);
    });

    it("should fetch list timeline with untilId parameter", async () => {
      const mockNotes = [
        { id: "note3", text: "Test note 3" },
        { id: "note4", text: "Test note 4" },
      ];
      const listId = "test-list-id";
      const untilId = "note2";

      mockRequest.mockResolvedValueOnce(mockNotes);

      const result = await listApi.getListTimeline(listId, untilId);

      expect(mockRequest).toHaveBeenCalledWith("notes/user-list-timeline", {
        listId,
        untilId,
      });
      expect(result).toEqual(mockNotes);
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Timeline API Error");
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(listApi.getListTimeline("test-list-id")).rejects.toThrow(
        "Timeline API Error",
      );
    });
  });

  describe("createList", () => {
    it("should create a new list successfully", async () => {
      const mockCreatedList = {
        id: "new-list-id",
        name: "New List",
        description: "",
        isPublic: false,
        userIds: [],
        createdAt: "2023-01-03T00:00:00.000Z",
      };

      mockRequest.mockResolvedValueOnce(mockCreatedList);

      const result = await listApi.createList("New List");

      expect(mockRequest).toHaveBeenCalledWith("users/lists/create", {
        name: "New List",
        isPublic: false,
      });
      expect(result).toEqual(mockCreatedList);
    });

    it("should create a public list", async () => {
      const mockCreatedList = {
        id: "public-list-id",
        name: "Public List",
        description: "",
        isPublic: true,
        userIds: [],
        createdAt: "2023-01-03T00:00:00.000Z",
      };

      mockRequest.mockResolvedValueOnce(mockCreatedList);

      const result = await listApi.createList("Public List", true);

      expect(mockRequest).toHaveBeenCalledWith("users/lists/create", {
        name: "Public List",
        isPublic: true,
      });
      expect(result).toEqual(mockCreatedList);
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Create List Error");
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(listApi.createList("New List")).rejects.toThrow(
        "Create List Error",
      );
    });
  });

  describe("deleteList", () => {
    it("should delete a list successfully", async () => {
      const listId = "list-to-delete";

      mockRequest.mockResolvedValueOnce(undefined);

      await listApi.deleteList(listId);

      expect(mockRequest).toHaveBeenCalledWith("users/lists/delete", {
        listId,
      });
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Delete List Error");
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(listApi.deleteList("list-id")).rejects.toThrow(
        "Delete List Error",
      );
    });
  });

  describe("updateList", () => {
    it("should update a list successfully", async () => {
      const listId = "list-to-update";
      const updatedName = "Updated List Name";
      const mockUpdatedList = {
        id: listId,
        name: updatedName,
        description: "",
        isPublic: false,
        userIds: [],
        createdAt: "2023-01-01T00:00:00.000Z",
      };

      mockRequest.mockResolvedValueOnce(mockUpdatedList);

      const result = await listApi.updateList(listId, updatedName);

      expect(mockRequest).toHaveBeenCalledWith("users/lists/update", {
        listId,
        name: updatedName,
      });
      expect(result).toEqual(mockUpdatedList);
    });

    it("should update a list with isPublic parameter", async () => {
      const listId = "list-to-update";
      const updatedName = "Updated List Name";
      const isPublic = true;
      const mockUpdatedList = {
        id: listId,
        name: updatedName,
        description: "",
        isPublic,
        userIds: [],
        createdAt: "2023-01-01T00:00:00.000Z",
      };

      mockRequest.mockResolvedValueOnce(mockUpdatedList);

      const result = await listApi.updateList(listId, updatedName, isPublic);

      expect(mockRequest).toHaveBeenCalledWith("users/lists/update", {
        listId,
        name: updatedName,
        isPublic,
      });
      expect(result).toEqual(mockUpdatedList);
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Update List Error");
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(listApi.updateList("list-id", "New Name")).rejects.toThrow(
        "Update List Error",
      );
    });
  });

  describe("addUserToList", () => {
    it("should add user to list successfully", async () => {
      const listId = "test-list-id";
      const userId = "user-to-add";

      mockRequest.mockResolvedValueOnce(undefined);

      await listApi.addUserToList(listId, userId);

      expect(mockRequest).toHaveBeenCalledWith("users/lists/push", {
        listId,
        userId,
      });
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Add User Error");
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(listApi.addUserToList("list-id", "user-id")).rejects.toThrow(
        "Add User Error",
      );
    });
  });

  describe("removeUserFromList", () => {
    it("should remove user from list successfully", async () => {
      const listId = "test-list-id";
      const userId = "user-to-remove";

      mockRequest.mockResolvedValueOnce(undefined);

      await listApi.removeUserFromList(listId, userId);

      expect(mockRequest).toHaveBeenCalledWith("users/lists/pull", {
        listId,
        userId,
      });
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Remove User Error");
      mockRequest.mockRejectedValueOnce(mockError);

      await expect(
        listApi.removeUserFromList("list-id", "user-id"),
      ).rejects.toThrow("Remove User Error");
    });
  });

  describe("error handling", () => {
    it("should handle network errors", async () => {
      const networkError = new Error("Network Error");
      mockRequest.mockRejectedValueOnce(networkError);

      await expect(listApi.getUserLists()).rejects.toThrow("Network Error");
    });

    it("should handle timeout errors", async () => {
      const timeoutError = new Error("Request timeout");
      mockRequest.mockRejectedValueOnce(timeoutError);

      await expect(listApi.getListTimeline("list-id")).rejects.toThrow(
        "Request timeout",
      );
    });

    it("should handle authentication errors", async () => {
      const authError = new Error("401 Unauthorized");
      mockRequest.mockRejectedValueOnce(authError);

      await expect(listApi.createList("Test List")).rejects.toThrow(
        "401 Unauthorized",
      );
    });
  });
});
