import { Card } from "@/Component/ui/card";
import { Spinner } from "@/Component/ui/spinner";
import { Heading } from "@/Component/ui/styled/heading";
import { Text } from "@/Component/ui/styled/text";
import { $api } from "@/lib/api/fetchClient";
import { css } from "styled-system/css";

export function TimelineList() {
  const { data: timelines, status } = $api.useQuery("get", "/v1/timeline", {});

  return (
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
          <div className={css({ display: "flex", flexDirection: "column" })}>
            {timelines && timelines.length > 0 ? (
              <ul>
                {timelines.map((timeline) => (
                  <Card.Root key={timeline.id}>
                    <Card.Header>
                      <Heading as="h3" size="md">
                        {timeline.name} {/* Display timeline name */}
                      </Heading>
                    </Card.Header>
                    <Card.Body>
                      <li key={timeline.id} className="mb-2 p-2 border rounded">
                        <Text fontWeight="bold">
                          Server Origin: {timeline.serverSession.origin}
                        </Text>
                        <Text size="sm" color="gray.600">
                          Type: {timeline.type}
                        </Text>
                        {/* Add more details or actions as needed */}
                      </li>
                    </Card.Body>
                  </Card.Root>
                ))}
              </ul>
            ) : (
              <Text>No timelines created yet.</Text>
            )}
          </div>
        )}
      </Card.Body>
    </Card.Root>
  );
}
