import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("should render the component", () => {
    render(<Badge>New</Badge>);
    // Add assertions here based on the content of Badge
  });
});
