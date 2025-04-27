import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { HomeTimelineContent } from "./HomeTimelineContent";

describe("HomeTimelineContent", () => {
  it("should render the component", () => {
    // Provide the required 'origin', 'token', and 'type' props
    render(
      <HomeTimelineContent
        origin="test-origin"
        token="test-token"
        type="test-type"
      />,
    );
    // Add assertions here based on the content of HomeTimelineContent
  });
});
