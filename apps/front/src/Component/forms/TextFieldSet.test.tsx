import { describe } from "node:test";
import { userEvent } from "@storybook/test";
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { expect, it } from "vitest";
import { TextFieldSet } from "./TextFieldSet";

// テスト用のラッパーコンポーネント
const TestWrapper = () => {
  const { control } = useForm({
    defaultValues: {
      testField: "",
    },
  });

  return (
    <TextFieldSet
      name="testField"
      control={control}
      label="Test Label"
      type="text"
      placeholder="Test Placeholder"
      validation="Test Validation"
      rules={{
        required: "This field is required",
      }}
    />
  );
};

describe("TextFieldSet", () => {
  it("renders label and validation text correctly", () => {
    render(<TestWrapper />);

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Test Validation")).toBeInTheDocument();
  });

  it("renders input with correct attributes", () => {
    render(<TestWrapper />);

    const input = screen.getByPlaceholderText("Test Placeholder");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("shows error message when validation fails", async () => {
    render(<TestWrapper />);

    const input = screen.getByPlaceholderText("Test Placeholder");
    await userEvent.type(input, "test");
    await userEvent.clear(input);

    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("updates input value correctly", async () => {
    render(<TestWrapper />);

    const input = screen.getByPlaceholderText("Test Placeholder");
    await userEvent.type(input, "test value");

    expect(input).toHaveValue("test value");
  });
});
