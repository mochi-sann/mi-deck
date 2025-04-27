import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { Layout } from "./Layout";

describe("Layout", () => {
  it("should render the component", () => {
    // You would typically pass required props here if any
    // render(<Layout {...props} />);
    // Provide the required 'children' prop
    render(
      <Layout>
        <div>Mock Children</div>
      </Layout>,
    );
    // Add assertions here based on the content of Layout
  });
});
