import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { StyledLink } from "./Link";

describe("Link", () => {
  it("should render the component", () => {
    // You would typically pass required props here if any
    // render(<Link {...props} />);
    render(<StyledLink to="/">Test Link</StyledLink>);
    // Add assertions here based on the content of StyledLink
  });
});
