import { MenuFieldSet } from "@/Component/forms/MenuFieldSet";
import { TextFieldSet } from "@/Component/forms/TextFieldSet";
import { Button } from "@/Component/ui/button";
import Text from "@/Component/ui/text";
import { $api } from "@/lib/api/fetchClient";
import { components } from "@/lib/api/type";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "react-hook-form";
import * as v from "valibot";

// Define the type based on the API schema, making conditional fields optional initially
type CreateTimelineFormType = Omit<
  components["schemas"]["CreateTimelineDto"],
  "listId" | "channelId" // Omit these as they are handled by refine
> & {
  listId?: string;
  channelId?: string;
};

// Define the schema based on CreateTimelineDto matching the API spec
const schema = v.object({
  serverSessionId: v.pipe(
    v.string(),
    v.uuid("Server Session ID is required."),
    v.transform((value) => String(value)),
  ),
  name: v.pipe(v.string(), v.minLength(1, "Timeline name is required.")),
  type: v.union(
    [
      v.literal("HOME"),
      v.literal("LOCAL"),
      v.literal("GLOBAL"),
      v.literal("LIST"),
      v.literal("USER"),
      v.literal("CHANNEL"),
    ],
    "Timeline type is required.",
  ),
  listId: v.optional(v.string()),
  channelId: v.optional(v.string()),
});

// Custom validation for LIST type
const listValidation = v.object({
  type: v.literal("LIST"),
  listId: v.string("List ID is required when type is LIST."),
});

// Custom validation for CHANNEL type
const channelValidation = v.object({
  type: v.literal("CHANNEL"),
  channelId: v.string("Channel ID is required when type is CHANNEL."),
});

// Combine the schema with custom validations
const finalSchema = v.union([
  v.intersect([schema, listValidation]),
  v.intersect([schema, channelValidation]),
  v.intersect([
    schema,
    v.object({
      type: v.union([
        v.literal("HOME"),
        v.literal("LOCAL"),
        v.literal("GLOBAL"),
        v.literal("USER"),
      ]),
    }),
  ]),
]);

type CreateTimelineFormProps = {
  serverSessions:
    | {
        id: string;
        userId: string;
        origin: string;
        serverToken: string;
        serverType: "Misskey" | "OtherServer";
        createdAt: string;
        updatedAt: string;
      }[]
    | undefined;
};
export function CreateTimelineForm(props: CreateTimelineFormProps) {
  const { mutate, status, error } = $api.useMutation(
    "post",
    "/v1/timeline", // Use the correct endpoint path
    {}, // Options can be added here if needed (e.g., onSuccess, onError callbacks)
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateTimelineFormType>({
    resolver: valibotResolver(schema),
    defaultValues: {
      serverSessionId: "",
      name: "",
      type: "HOME",
      listId: "",
      channelId: "",
    },
  });

  // Handle form submission

  const selectedType = watch("type"); // Watch the 'type' field to conditionally render inputs

  // Display loading state while fetching server sessions

  // Prepare options for the server session dropdown
  const serverOptions = props.serverSessions?.map((session) => ({
    // Use a more descriptive label, perhaps including the server name if available later
    label: `${session.origin} (${session.serverType})`,
    value: session.id,
  }));

  // Options for the timeline type dropdown - use uppercase values and add CHANNEL
  const timelineTypeOptions = [
    { label: "Home", value: "HOME" },
    { label: "Local", value: "LOCAL" },
    { label: "Global", value: "GLOBAL" },
    { label: "List", value: "LIST" },
    { label: "User", value: "USER" }, // Assuming USER type exists, though not in CreateTimelineDto enum
    { label: "Channel", value: "CHANNEL" },
  ];

  const onSubmit = (data: CreateTimelineFormType) => {
    console.log("data", data);
    // Prepare data for submission, removing empty optional fields
    const submissionData: components["schemas"]["CreateTimelineDto"] = {
      ...data,
      listId: data.type === "LIST" ? data.listId : undefined,
      channelId: data.type === "CHANNEL" ? data.channelId : undefined,
    };
    // Remove undefined keys before sending
    // Object.keys(submissionData).forEach((key) => {
    //   if (submissionData[key as keyof typeof submissionData] === undefined) {
    //     delete submissionData[key as keyof typeof submissionData];
    //   }
    // });

    console.log("Submitting Form Data:", submissionData);
    mutate({
      body: submissionData,
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MenuFieldSet
        control={control}
        name="serverSessionId"
        label="Server Session"
        placeholder="Select a server session"
        collection={serverOptions || []}
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
        isLoading={status === "pending"}
        buttonWidth={"full"}
      >
        Create Timeline
      </Button>

      {/* Display API call error */}
      {status === "error" && (
        <Text colorType={"denger"}>
          Error: {error && "Failed to create timeline."}
        </Text>
      )}
      {status === "success" && (
        <Text colorType={"denger"}>Timeline created successfully!</Text>
      )}
    </form>
  );
}
