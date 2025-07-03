import { createLazyFileRoute } from "@tanstack/react-router";
import Text from "@/components/ui/text";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { CreateTimelineFormPresentation } from "./-form/CreateTimelineFormPresentation";

export const Route = createLazyFileRoute("/_authed/create-timeline")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader>
        <Text variant={"h1"}>Create New Timeline</Text>
      </CardHeader>
      <CardContent>
        <CreateTimelineFormPresentation />
      </CardContent>
    </Card>
  );
}
