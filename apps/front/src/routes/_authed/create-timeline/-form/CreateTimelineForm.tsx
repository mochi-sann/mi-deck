import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { $api } from "../../../../lib/api/api";
import { components } from "../../../../lib/api/type";
import { Button } from "../../../../Component/ui/button";
import { TextFieldSet } from "../../../../Component/forms/TextFieldSet";
import { MenuFieldSet } from "../../../../Component/forms/MenuFieldSet";
import { Text } from "../../../../Component/ui/text";
import { useQuery } from "@tanstack/react-query";

type CreateTimelineFormType = components["schemas"]["CreateTimelineDto"];

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
    queryFn: async () => {
      const res = await $api.get("/v1/server-sessions");
      if (res.status !== 200) { // Assuming 200 is the success code based on type.ts update
        throw new Error("Failed to fetch server sessions");
      }
      return res.data;
    },
  });

  const { mutate, status, error } = $api.useMutation(
    "post",
    "/v1/timeline",
    {},
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

  const onSubmit = (data: CreateTimelineFormType) => {
    console.log("Form Data:", data);
    mutate(data);
  };

  const selectedType = watch("type");

  if (isLoadingSessions) return <Text>Loading server sessions...</Text>;
  if (sessionsError)
    return <Text color="red.500">Error loading server sessions.</Text>;
  if (!serverSessions || serverSessions.length === 0)
    return <Text>No server sessions found. Please add a server first.</Text>;

  const serverOptions = serverSessions.map((session) => ({
    label: `${session.origin} (${session.serverType})`, // Adjust label as needed
    value: session.id,
  }));

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
          name="params.listId" // Assuming params structure
          label="List ID"
          placeholder="Enter List ID"
          type="text"
          // Add validation if needed
          validation={""} // errors.params?.listId?.message ?? ""
        />
      )}
      {selectedType === "User" && (
        <TextFieldSet
          control={control}
          name="params.userId" // Assuming params structure
          label="User ID"
          placeholder="Enter User ID"
          type="text"
          // Add validation if needed
          validation={""} // errors.params?.userId?.message ?? ""
        />
      )}

      <Button type="submit" disabled={status === "pending"} mt="4">
        {status === "pending" ? "Creating..." : "Create Timeline"}
      </Button>

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
