import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { NavUser } from "./nav-user";

describe("NavUser", () => {
  it("should render the component", () => {
    // You would typically pass required props here if any
    // render(<NavUser {...props} />);
    render(<NavUser />);
    // Add assertions here based on the content of NavUser
  });
});
