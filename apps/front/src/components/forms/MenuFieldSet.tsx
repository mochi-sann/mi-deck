import {
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";
import { FormItem } from "../ui/form";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Text from "../ui/text";

type LabelProps = {
  placeholder: string;
  validation: string;
  label: string;
  required?: boolean;
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
    required = false,
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
      <Label>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>
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
      {error && <Text colorType={"denger"}>{error.message}</Text>}
    </FormItem>
  );
};
