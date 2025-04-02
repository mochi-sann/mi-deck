import { MenuFieldSet } from "@/Component/forms/MenuFieldSet";
import { TextFieldSet } from "@/Component/forms/TextFieldSet";
import { $api } from "@/lib/api/fetchClient";
import { components } from "@/lib/api/type";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define the type based on the API schema, making conditional fields optional initially
type CreateTimelineFormType = Omit<
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

export function CreateTimelineForm() {
  const {
    data: serverSessions,
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = useQuery({
    queryKey: ["serverSessions"],
    // Fetch server sessions to populate the dropdown
    queryFn: async () => {
      // The getList operation expects a 201 status for success according to type.ts
      const res = await $api.get("/v1/server-sessions");
      if (res.status !== 201) {
        console.error("Failed to fetch server sessions:", res);
        throw new Error(
          `Failed to fetch server sessions. Status: ${res.status}`,
        );
      }
      // Ensure the response data is an array before returning
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // Mutation hook for creating the timeline
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

  // Handle form submission
  const onSubmit = (data: CreateTimelineFormType) => {
    // Prepare data for submission, removing empty optional fields
    const submissionData: components["schemas"]["CreateTimelineDto"] = {
      ...data,
      listId: data.type === "LIST" ? data.listId : undefined,
      channelId: data.type === "CHANNEL" ? data.channelId : undefined,
    };
    // Remove undefined keys before sending
    Object.keys(submissionData).forEach((key) => {
      if (submissionData[key as keyof typeof submissionData] === undefined) {
        delete submissionData[key as keyof typeof submissionData];
      }
    });

    console.log("Submitting Form Data:", submissionData);
    mutate(submissionData);
  };

  const selectedType = watch("type"); // Watch the 'type' field to conditionally render inputs

  // Display loading state while fetching server sessions
  if (isLoadingSessions) return <Spinner label="Loading server sessions..." />;
  // Display error state if fetching sessions failed
  if (sessionsError)
    return (
      <Text color="red.500">
        Error loading server sessions: {sessionsError.message}
      </Text>
    );
  // Display message if no sessions are available
  if (!serverSessions || serverSessions.length === 0)
    return <Text>No server sessions found. Please add a server first.</Text>;

  // Prepare options for the server session dropdown
  const serverOptions = serverSessions.map((session) => ({
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
      {selectedType === "List" && (
        <TextFieldSet
          control={control}
          control={control}
          name="params.listId" // Use dot notation for nested fields in react-hook-form
          label="List ID"
          placeholder="Enter List ID"
          type="text"
          validation={errors.params?.listId?.message ?? ""} // Display validation errors
        />
      )}
      {selectedType === "User" && (
        <TextFieldSet
          control={control}
          name="params.userId" // Use dot notation
          label="User ID"
          placeholder="Enter User ID"
          type="text"
          validation={errors.params?.userId?.message ?? ""} // Display validation errors
        />
      )}

      {/* Display general form errors from refine (now targeting params) */}
      {errors.params?.message &&
        !errors.params.listId &&
        !errors.params.userId && ( // Show only if specific field errors aren't present
          <Text color="red.500" mt="2">
            {errors.params.message}
          </Text>
        )}

      <Button
        type="submit"
        loading={status === "pending"}
        loadingText="Creating..."
        mt="4"
      >
        Create Timeline
      </Button>

      {/* Display API call error */}
      {status === "error" && (
        <Text color="red.500" mt="2">
          Error: {error?.message || "Failed to create timeline."}
        </Text>
      )}
      {status === "success" && (
        <Text color="green.500" mt="2">
          Timeline created successfully!
        </Text>
      )}
    </form>
  );
}
