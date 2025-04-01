import { MenuFieldSet } from "@/Component/forms/MenuFieldSet";
import { TextFieldSet } from "@/Component/forms/TextFieldSet";
import { $api } from "@/lib/api/fetchClient";
import { components } from "@/lib/api/type";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";

type CreateTimelineFormType = components["schemas"]["CreateTimelineDto"];
// Define the schema based on CreateTimelineDto
const schema = z.object({
  serverSessionId: z.string().uuid("Server Session ID is required."),
  name: z.string().min(1, "Timeline name is required."),
  type: z.enum(["Home", "Local", "Global", "List", "User"], {
    errorMap: () => ({ message: "Timeline type is required." }),
  }),
  // params は type が 'List' または 'User' の場合に必要になる可能性がある
  // ここでは簡単化のため、バリデーションは省略
  params: z.record(z.any()).optional(),
});

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
    defaultValues: {
      serverSessionId: "",
      name: "",
      type: "Home",
      params: {},
    },
  });

  // Handle form submission
  const onSubmit = (data: CreateTimelineFormType) => {
    // Ensure params is an empty object if not needed or empty, rather than undefined
    const submissionData = {
      ...data,
      params: data.params ?? {},
    };
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

  // Options for the timeline type dropdown
  const timelineTypeOptions = [
    { label: "Home", value: "Home" },
    { label: "Local", value: "Local" },
    { label: "Global", value: "Global" },
    { label: "List", value: "List" },
    { label: "User", value: "User" },
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
