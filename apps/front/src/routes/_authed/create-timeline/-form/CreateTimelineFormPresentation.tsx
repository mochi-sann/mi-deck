import { Spinner } from "@/Component/ui/spinner";
import Text from "@/Component/ui/text";
import { useStorage } from "@/lib/storage/context";
import { Suspense } from "react";
import { CreateTimelineForm } from "./CreateTimelineForm";

// Define the type based on the API schema, making conditional fields optional initially
// Define the schema based on CreateTimelineDto matching the API spec

export function CreateTimelineFormPresentation() {
  const { servers, isLoading, error } = useStorage();

  // Display loading state while fetching servers
  if (isLoading) return <Spinner />;
  // Display error state if fetching servers failed
  if (error) return <Text color="red.500">Error loading servers: {error}</Text>;
  // Display message if no servers are available
  if (!servers || servers.length === 0)
    return <Text>No servers found. Please add a server first.</Text>;

  // Prepare options for the server session dropdown
  // const serverOptions = serverSessions.map((session) => ({
  //   // Use a more descriptive label, perhaps including the server name if available later
  //   label: `${session.origin} (${session.serverType})`,
  //   value: session.id,
  // }));
  return (
    <div>
      <Suspense fallback={<Spinner />}>
        <CreateTimelineForm servers={servers} />
      </Suspense>
    </div>
  );
}
