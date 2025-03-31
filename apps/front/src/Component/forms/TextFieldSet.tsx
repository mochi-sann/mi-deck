import {
  FieldValues,
  UseControllerProps,
  useController,
} from "react-hook-form";
import { Field } from "../ui/field";
import { Input } from "../ui/input";

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
    <Field.Root>
      <Field.Label>
        <span>{label}</span>
        <br />
        <span>{validation}</span>
      </Field.Label>
      <Field.Input asChild>
        <Input {...field} type={type} placeholder={placeholder} />
      </Field.Input>
      {error && <Field.ErrorText>{error.message}</Field.ErrorText>}
    </Field.Root>
  );
};
