import { MenuFieldSet } from "@/Component/forms/MenuFieldSet";
import { TextFieldSet } from "@/Component/forms/TextFieldSet";
import { Button } from "@/Component/ui/button";
import { Text } from "@/Component/ui/text";
import { components } from "@/lib/api/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import * as z from "zod";

// Define the type based on the API schema, making conditional fields optional initially
export type CreateTimelineFormType = Omit<
  components["schemas"]["CreateTimelineDto"],
  "listId" | "channelId" // Omit these as they are handled by refine
> & {
  listId?: string;
  channelId?: string;
};

// Define the schema based on CreateTimelineDto matching the API spec
const schema = z
  .object({
    serverSessionId: z.string().uuid("Server Session ID is required."),
    name: z.string().min(1, "Timeline name is required."),
    // Use uppercase enum values and include CHANNEL
    type: z.enum(["HOME", "LOCAL", "GLOBAL", "LIST", "USER", "CHANNEL"], {
      errorMap: () => ({ message: "Timeline type is required." }),
    }),
    // listId and channelId are optional at the top level
    listId: z.string().optional(),
    channelId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "LIST") {
        return !!data.listId && data.listId.trim().length > 0;
      }
      return true;
    },
    {
      message: "List ID is required when type is LIST.",
      path: ["listId"], // Specify the path for the error message
    },
  )
  .refine(
    (data) => {
      if (data.type === "CHANNEL") {
        return !!data.channelId && data.channelId.trim().length > 0;
      }
      return true;
    },
    {
      message: "Channel ID is required when type is CHANNEL.",
      path: ["channelId"], // Specify the path for the error message
    },
  );

// Options for the timeline type dropdown - use uppercase values and add CHANNEL
const timelineTypeOptions = [
  { label: "Home", value: "HOME" },
  { label: "Local", value: "LOCAL" },
  { label: "Global", value: "GLOBAL" },
  { label: "List", value: "LIST" },
  { label: "User", value: "USER" }, // Assuming USER type exists, though not in CreateTimelineDto enum
  { label: "Channel", value: "CHANNEL" },
];

type Option = { label: string; value: string };

type TimelineFormPresentationProps = {
  serverOptions: Option[];
  onSubmit: (data: CreateTimelineFormType) => void;
  isLoading: boolean;
  apiError: Error | null;
  apiSuccess: boolean;
};

export function TimelineFormPresentation({
  serverOptions,
  onSubmit,
  isLoading,
  apiError,
  apiSuccess,
}: TimelineFormPresentationProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateTimelineFormType>({
    resolver: zodResolver(schema),
    // Update default values to match the new schema structure
    defaultValues: {
      serverSessionId: "",
      name: "",
      type: "HOME", // Default to uppercase
      listId: "", // Initialize optional fields
      channelId: "",
    },
  });

  const selectedType = watch("type"); // Watch the 'type' field to conditionally render inputs

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MenuFieldSet
        control={control}
        name="serverSessionId"
        label="Server Session"
        placeholder="Select a server session"
        collection={serverOptions}
        validation={errors.serverSessionId?.message ?? ""}
      />

      <TextFieldSet
        control={control}
        name="name"
        label="Timeline Name"
        placeholder="Enter timeline name"
        type="text"
        validation={errors.name?.message ?? ""}
      />

      <MenuFieldSet
        control={control}
        name="type"
        label="Timeline Type"
        placeholder="Select timeline type"
        collection={timelineTypeOptions}
        validation={errors.type?.message ?? ""}
      />

      {/* Conditional fields based on type */}
      {selectedType === "LIST" && (
        <TextFieldSet
          control={control}
          name="listId" // Use correct field name from schema
          label="List ID"
          placeholder="Enter List ID"
          type="text"
          validation={errors.listId?.message ?? ""} // Display validation errors for listId
        />
      )}
      {selectedType === "CHANNEL" && (
        <TextFieldSet
          control={control}
          name="channelId" // Use correct field name from schema
          label="Channel ID"
          placeholder="Enter Channel ID"
          type="text"
          validation={errors.channelId?.message ?? ""} // Display validation errors for channelId
        />
      )}

      <Button
        type="submit"
        loading={isLoading}
        loadingText="Creating..."
        mt="4"
      >
        Create Timeline
      </Button>

      {/* Display API call error */}
      {apiError && (
        <Text color="red.500" mt="2">
          Error: {apiError?.message || "Failed to create timeline."}
        </Text>
      )}
      {apiSuccess && (
        <Text color="green.500" mt="2">
          Timeline created successfully!
        </Text>
      )}
    </form>
  );
}
