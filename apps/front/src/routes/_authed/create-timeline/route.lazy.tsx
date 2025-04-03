import { createLazyFileRoute } from "@tanstack/react-router";
import { Card } from "../../../Component/ui/card";
import { Heading } from "../../../Component/ui/heading";
import { CreateTimelineFormPresentation } from "./-form/CreateTimelineFormPresentation";

export const Route = createLazyFileRoute("/_authed/create-timeline")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card.Root maxW="md" mx="auto" mt="8">
      <Card.Header>
        <Heading as="h2" size="lg">
          Create New Timeline
        </Heading>
      </Card.Header>
      <Card.Body>
        <CreateTimelineFormPresentation />
      </Card.Body>
    </Card.Root>
  );
}
