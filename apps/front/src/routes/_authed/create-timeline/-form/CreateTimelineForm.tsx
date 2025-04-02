import { Spinner } from "@/Component/ui/spinner";
import { Text } from "@/Component/ui/text";
import { $api } from "@/lib/api/fetchClient";
import { components } from "@/lib/api/type";
import {
  CreateTimelineFormType,
  TimelineFormPresentation,
} from "./TimelineFormPresentation"; // Import the presentation component and type

export function CreateTimelineForm() {
  // Fetch server sessions
  const {
    data: serverSessions,
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = $api.useQuery("get", "/v1/server-sessions");
  // Mutation hook for creating the timeline
  const { mutate, status, error } = $api.useMutation(
    "post",
    "post",
    "/v1/timeline",
    {},
  );

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
    label: `${session.origin} (${session.serverType})`,
    value: session.id,
  }));

  // Handle form submission from the presentation component

  const onSubmit = (data: CreateTimelineFormType) => {
    console.log("Form data received from presentation:", data);
    // Prepare data for submission, removing empty optional fields based on type
    const submissionData: components["schemas"]["CreateTimelineDto"] = {
      serverSessionId: data.serverSessionId,
      name: data.name,
      type: data.type,
      listId: data.type === "LIST" ? data.listId : undefined,
      channelId: data.type === "CHANNEL" ? data.channelId : undefined,
    };

    console.log("Submitting Form Data to API:", submissionData);
    mutate({
      body: submissionData,
    });
  };

  // Render the presentation component, passing down necessary props
  return (
    <TimelineFormPresentation
      serverOptions={serverOptions}
      onSubmit={onSubmit}
      isLoading={status === "pending"}
      apiError={error} // Pass the mutation error object
      apiSuccess={status === "success"}
    />
  );
}
