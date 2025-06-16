import { Spinner } from "@/Component/ui/spinner";
import Text from "@/Component/ui/text";
import { $api } from "@/lib/api/fetchClient";
import { Suspense } from "react";
import { CreateTimelineForm } from "./CreateTimelineForm";

// Define the type based on the API schema, making conditional fields optional initially
// Define the schema based on CreateTimelineDto matching the API spec

export function CreateTimelineFormPresentation() {
  const {
    data: serverSessions,
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = $api.useSuspenseQuery("get", "/v1/server-sessions");
  // Mutation hook for creating the timeline

  // Handle form submission

  // Display loading state while fetching server sessions
  if (isLoadingSessions) return <Spinner />;
  // Display error state if fetching sessions failed
  if (sessionsError)
    return (
      <Text color="red.500">
        Error loading server sessions: {(sessionsError as Error).message}
      </Text>
    );
  // Display message if no sessions are available
  if (!serverSessions || serverSessions.length === 0)
    return <Text>No server sessions found. Please add a server first.</Text>;

  // Prepare options for the server session dropdown
  // const serverOptions = serverSessions.map((session) => ({
  //   // Use a more descriptive label, perhaps including the server name if available later
  //   label: `${session.origin} (${session.serverType})`,
  //   value: session.id,
  // }));
  return (
    <div>
      <Suspense fallback={<Spinner />}>
        <CreateTimelineForm serverSessions={serverSessions} />
      </Suspense>
    </div>
  );
}
