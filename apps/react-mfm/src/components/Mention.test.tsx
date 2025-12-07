import { render, screen } from "@testing-library/react";
import { Provider } from "jotai";
import { describe, expect, it } from "vitest";
import Mention from "./Mention";

describe("Mention", () => {
  it("renders local mention correctly", () => {
    render(<Mention username="user" acct="@user" host={null} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/@user");
    expect(link).toHaveTextContent("@user");
  });

  it("renders remote mention correctly", () => {
    render(
      <Mention username="user" host="example.com" acct="@user@example.com" />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com/@user");
    expect(link).toHaveTextContent("@user@example.com");
  });

  it("uses custom component from config", () => {
    const CustomMention = ({ username }: { username: string }) => (
      <span data-testid="custom-mention">User: {username}</span>
    );

    const store = {
      // biome-ignore lint/style/useNamingConvention: Property name matches MFM component convention
      get: () => ({ Mention: CustomMention }),
      set: () => {},
      sub: () => () => {},
    };

    render(
      // biome-ignore lint/suspicious/noExplicitAny: Test mock store type
      <Provider store={store as any}>
        <Mention username="custom" acct="@custom" host={null} />
      </Provider>,
    );

    expect(screen.getByTestId("custom-mention")).toHaveTextContent(
      "User: custom",
    );
  });
});
