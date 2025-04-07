import {
  FieldValues,
  UseControllerProps,
  useController,
} from "react-hook-form";
import { Field } from "../ui/field";
import { FormItem } from "../ui/form";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type LabelProps = {
  placeholder: string;
  validation: string;
  label: string;
  collection: Array<
    | { label: string; value: string; disabled?: undefined }
    | { label: string; value: string; disabled: boolean }
  >;
};
type MenuFieldSetProps<T extends FieldValues> = UseControllerProps<T> &
  LabelProps;
export const MenuFieldSet = <T extends FieldValues>(
  props: MenuFieldSetProps<T>,
) => {
  const {
    label,
    name,
    control,
    rules,
    collection: propsCollectionList,
    placeholder,
  } = props;
  const { field, fieldState } = useController<T>({
    name,
    control,
    rules,
  });
  const { onChange, ...OtherField } = field;
  const { error } = fieldState;
  return (
    <FormItem>
      <Label>{label}</Label>
      <Select
        onValueChange={(value) => {
          // Only pass the selected value to react-hook-form
          onChange(value);
        }}
        {...OtherField}
        // collection={collection}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {propsCollectionList.map((value) => (
            <SelectItem value={value.value} key={value.value}>
              {value.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <Field.ErrorText>{error.message}</Field.ErrorText>}
    </FormItem>
  );
};
