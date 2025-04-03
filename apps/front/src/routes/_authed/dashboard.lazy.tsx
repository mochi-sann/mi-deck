import { MisskeyJsTest } from "@/Component/logics/MisskeyJsTest";
import { $api } from "@/lib/api/fetchClient";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Heading } from "@/Component/ui/styled/heading";
import { Text } from "@/Component/ui/styled/text";
import { Spinner } from "@/Component/ui/spinner";
import { Card } from "@/Component/ui/card";
import React from "react";

export const Route = createLazyFileRoute("/_authed/dashboard")({
  component: DashBoard,
});

function DashBoard() {
  const { data: timelines, status } = $api.useQuery("get", "/v1/timeline", {});
  return (
    <div>
      Hello "/_authed/dashboard"!
      <MisskeyJsTest />
      <Heading as="h2" size="lg" mb="4">
        Dashboard
      </Heading>
      <MisskeyJsTest />
      <Card.Root mt="6">
        <Card.Header>
          <Heading as="h3" size="md">
            Your Timelines
          </Heading>
        </Card.Header>
        <Card.Body>
          {status === "pending" && <Spinner label="Loading timelines..." />}
          {status === "error" && (
            <Text color="red.500">Failed to load timelines.</Text>
          )}
          {status === "success" && (
            <React.Fragment>
              {timelines && timelines.length > 0 ? (
                <ul>
                  {timelines.map((timeline) => (
                    <li key={timeline.id} className="mb-2 p-2 border rounded">
                      <Text fontWeight="bold">name : {timeline.name}</Text>
                      <Text fontWeight="bold">
                        serverId {timeline.serverSessionId}
                      </Text>
                      <Text fontWeight="bold">
                        origin {timeline.serverSession.origin}
                      </Text>
                      <Text size="sm" color="gray.600">
                        Type: {timeline.type}
                      </Text>
                      {/* Add more details or actions as needed */}
                    </li>
                  ))}
                </ul>
              ) : (
                <Text>No timelines created yet.</Text>
              )}
            </React.Fragment>
          )}
        </Card.Body>
      </Card.Root>
    </div>
  );
}
