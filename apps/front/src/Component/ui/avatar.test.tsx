import { render } from "@testing-library/react";
import { describe, it } from "vitest";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

describe("Avatar", () => {
  it("should render the Avatar component", () => {
    render(<Avatar />);
    // Add assertions here based on the content of Avatar
  });

  it("should render the AvatarImage component", () => {
    render(<AvatarImage src="test.jpg" alt="Test Avatar" />);
    // Add assertions here based on the content of AvatarImage
  });

  it("should render the AvatarFallback component", () => {
    render(<AvatarFallback>CN</AvatarFallback>);
    // Add assertions here based on the content of AvatarFallback
  });
});
