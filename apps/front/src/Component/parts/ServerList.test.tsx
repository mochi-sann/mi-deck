import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { vi } from "vitest";
import { ServerInfoBox } from "./ServerList";

describe("ServerInfoBox", () => {
  it("should render the component", () => {
    // Provide mock props for ServerInfoBox
    const mockServerInfo = {
      id: "mock-id",
      userId: "mock-user-id",
      origin: "test-origin",
      serverToken: "mock-server-token",
      serverType: "Misskey" as "Misskey" | "OtherServer", // Explicitly cast to the union type
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const mockOnClick = vi.fn();

    render(<ServerInfoBox serverInfo={mockServerInfo} onClick={mockOnClick} />);
    // Add assertions here based on the content of ServerInfoBox
  });
});
