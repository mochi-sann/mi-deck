import {
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";
import { FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type LabelProps = {
  label: string;
  type: string;
  placeholder: string;
  validation: string;
};
type TextFieldSetProps<T extends FieldValues> = UseControllerProps<T> &
  LabelProps;
export const TextFieldSet = <T extends FieldValues>(
  props: TextFieldSetProps<T>,
) => {
  const { label, validation, name, control, rules, type, placeholder } = props;
  const { field, fieldState } = useController<T>({
    name,
    control,
    rules,
  });
  const { error } = fieldState;
  return (
    <FormItem>
      <Label>
        <span>{label}</span>
        <br />
        <span>{validation}</span>
      </Label>
      <Input {...field} type={type} placeholder={placeholder} />
      {error && <FormMessage>{error.message}</FormMessage>}
    </FormItem>
  );
};
