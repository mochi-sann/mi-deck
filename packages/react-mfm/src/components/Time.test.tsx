import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MfmTime from "./Time";

const secondsInYear = 31_536_000;

describe("MfmTime", () => {
  it("detail モードで YYYY/M/D h:mm:ss (XX年前) 形式を表示する", () => {
    const baseTimestamp = Date.UTC(2002, 0, 3, 4, 33, 20);
    const origin = new Date(baseTimestamp + 24 * secondsInYear * 1000);

    render(
      <MfmTime time={new Date(baseTimestamp)} origin={origin} mode="detail" />,
    );

    const timeElement = screen.getByText((_content, node) => {
      if (!(node instanceof HTMLElement)) return false;
      return node.tagName === "TIME" && node.textContent?.includes("24年前");
    });

    expect(timeElement).toHaveTextContent(/^2002\/1\/3/);
    expect(timeElement).toHaveTextContent(/24年前/);
  });

  it("未来の日時は XX年後 として表示する", () => {
    const baseTimestamp = Date.UTC(2024, 0, 1, 0, 0, 0);
    const slightlyMoreThanYear = secondsInYear + 1000;
    const time = new Date(baseTimestamp + slightlyMoreThanYear * 1000);

    render(<MfmTime time={time} origin={new Date(baseTimestamp)} />);

    expect(screen.getByText("1年後")).toBeInTheDocument();
  });

  it("不正な日時はプレースホルダーを表示する", () => {
    render(<MfmTime time={null} />);

    expect(screen.getByText("不正な日時")).toBeInTheDocument();
  });
});
