import { render, screen } from "@testing-library/react";
import { Provider } from "jotai";
import { describe, expect, it } from "vitest";
import Hashtag from "./Hashtag";

describe("Hashtag", () => {
  it("renders default hashtag style correctly", () => {
    render(<Hashtag hashtag="test" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/tags/test");
    expect(link).toHaveTextContent("#test");
    expect(link).toHaveAttribute("rel", "nofollow noopener");
  });

  it("uses custom component from config", () => {
    const CustomHashtag = ({ hashtag }: { hashtag: string }) => (
      <span data-testid="custom-hashtag">Custom: {hashtag}</span>
    );

    const store = {
      // biome-ignore lint/style/useNamingConvention: Property name matches MFM component convention
      get: () => ({ Hashtag: CustomHashtag }),
      set: () => {},
      sub: () => () => {},
    };

    render(
      // biome-ignore lint/suspicious/noExplicitAny: Test mock store type
      <Provider store={store as any}>
        <Hashtag hashtag="custom" />
      </Provider>,
    );

    expect(screen.getByTestId("custom-hashtag")).toHaveTextContent(
      "Custom: custom",
    );
  });
});
