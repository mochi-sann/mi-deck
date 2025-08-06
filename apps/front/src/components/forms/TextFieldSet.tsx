import {
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";
import { FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Text from "../ui/text";

type LabelProps = {
  label: string;
  type: string;
  placeholder: string;
  validation?: string;
  required?: boolean;
};
export type TextFieldSetProps<T extends FieldValues> = UseControllerProps<T> &
  LabelProps;
export const TextFieldSet = <T extends FieldValues>(
  props: TextFieldSetProps<T>,
) => {
  const {
    label,
    validation,
    name,
    control,
    rules,
    type,
    placeholder,
    required = false,
  } = props;
  const { field, fieldState } = useController<T>({
    name,
    control,
    rules,
  });
  const { error } = fieldState;
  return (
    <FormItem>
      <Label>
        <span>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
        <br />
        <span>{validation}</span>
      </Label>
      <Input {...field} type={type} placeholder={placeholder} />
      {error && <Text colorType={"denger"}>{error.message}</Text>}
    </FormItem>
  );
};
