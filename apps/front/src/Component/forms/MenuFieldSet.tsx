import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";
import { Field } from "../ui/field";
import { Select, createListCollection } from "../ui/select";

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
  const collection = createListCollection({
    items: propsCollectionList,
  });
  return (
    <Field.Root>
      <Field.Label />
      <Field.Select asChild>
        <Select.Root
          positioning={{ sameWidth: true }}
          width="full"
          onValueChange={onChange}
          {...OtherField}
          collection={collection}
        >
          <Select.Label>{label}</Select.Label>
          <Select.Control {...field}>
            <Select.Trigger width={"full"}>
              <Select.ValueText placeholder={placeholder} />
              <ChevronsUpDownIcon />
            </Select.Trigger>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              <Select.ItemGroup>
                {collection.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator>
                      <CheckIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.ItemGroup>
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Field.Select>
      {error && <Field.ErrorText>{error.message}</Field.ErrorText>}
    </Field.Root>
  );
};
