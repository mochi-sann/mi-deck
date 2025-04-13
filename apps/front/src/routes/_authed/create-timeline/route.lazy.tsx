import { createLazyFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader } from "../../../Component/ui/card";
import { Heading } from "../../../Component/ui/heading";
import { CreateTimelineFormPresentation } from "./-form/CreateTimelineFormPresentation";

export const Route = createLazyFileRoute("/_authed/create-timeline")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader>
        <Heading as="h2" size="lg">
          Create New Timeline
        </Heading>
      </CardHeader>
      <CardContent>
        <CreateTimelineFormPresentation />
      </CardContent>
    </Card>
  );
}
