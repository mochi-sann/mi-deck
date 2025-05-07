import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { MenuFieldSet } from "./MenuFieldSet"; // テスト対象のコンポーネント

type TestFormValues = {
  testField: string;
};

const mockCollection = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3", disabled: true },
];

describe("MenuFieldSet Component", () => {
  it("renders label, placeholder, and options correctly", () => {
    const Wrapper = () => {
      const methods = useForm<TestFormValues>();
      return (
        <FormProvider {...methods}>
          <form>
            <MenuFieldSet<TestFormValues>
              name="testField"
              control={methods.control}
              label="Test Label"
              placeholder="Select an option"
              validation="" // validation message not tested here
              collection={mockCollection}
            />
          </form>
        </FormProvider>
      );
    };

    render(<Wrapper />);

    // ラベルが表示されているか
    expect(screen.getByText("Test Label")).toBeInTheDocument();

    // プレースホルダーが表示されているか (SelectValue の textContent で確認)
    expect(screen.getByText("Select an option")).toBeInTheDocument();

    // SelectTrigger をクリックしてオプションを表示
    fireEvent.mouseDown(screen.getByRole("combobox"));

    // オプションが正しく表示されているか
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });
  it("displays validation error message when error exists", () => {
    const Wrapper = () => {
      const methods = useForm<TestFormValues>();
      methods.setError("testField", {
        type: "manual",
        message: "This field is required",
      });
      return (
        <FormProvider {...methods}>
          <form>
            <MenuFieldSet<TestFormValues>
              name="testField"
              control={methods.control}
              label="Test Label"
              placeholder="Select an option"
              validation="" // この props はエラーメッセージ表示には直接使われていない
              collection={mockCollection}
            />
          </form>
        </FormProvider>
      );
    };

    render(<Wrapper />);

    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });
});
