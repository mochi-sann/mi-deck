import { Button } from "@/Component/ui/button";
import Text from "@/Component/ui/text";
import { useSuspenseQuery } from "@tanstack/react-query";
import { APIClient } from "misskey-js/api.js";
import { Note } from "misskey-js/entities.js";
import { TimelineNotes } from "./TimelineNotes";

// Component to fetch and display posts for a single timeline
export function LocalTimelineContent({
  origin,
  token: serverToken,
  type,
}: {
  origin: string;
  token: string;
  type: string;
}) {
  // Define the query key
  const queryKey = ["timelineNotes", origin, type, serverToken]; // Include token in key if it can change

  const client = new APIClient({
    origin,
    credential: serverToken,
  });
  const {
    data: notes,
    error,
    isError,
    refetch,
  } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: async () => {
      try {
        const res = await client.request("notes/local-timeline", {});
        return res;
      } catch (err) {
        console.error("Local timeline fetch error:", {
          origin,
          error: err,
        });

        // Enhanced error handling
        if (err instanceof Error) {
          if (
            err.message.includes("401") ||
            err.message.includes("Unauthorized")
          ) {
            throw new Error("Authentication failed. Please re-login.");
          } else if (
            err.message.includes("403") ||
            err.message.includes("Forbidden")
          ) {
            throw new Error("Access denied. Check your permissions.");
          } else if (err.message.includes("404")) {
            throw new Error("Local timeline not found or server unreachable.");
          } else if (err.message.includes("500")) {
            throw new Error("Server error. Please try again later.");
          } else if (
            err.message.includes("fetch") ||
            err.message.includes("NetworkError")
          ) {
            throw new Error(`Network error: Unable to connect to ${origin}`);
          } else if (err.message.includes("timeout")) {
            throw new Error(
              `Timeout error: ${origin} is taking too long to respond`,
            );
          }
        } else if (typeof err === "object" && err !== null && "code" in err) {
          const misskeyError = err as { code: string; message?: string };
          switch (misskeyError.code) {
            case "RATE_LIMIT_EXCEEDED":
              throw new Error(
                "Rate limit exceeded. Please wait before trying again.",
              );
            case "INVALID_TOKEN":
            case "CREDENTIAL_REQUIRED":
              throw new Error("Invalid token. Please re-authenticate.");
            case "SUSPENDED":
              throw new Error("Your account has been suspended.");
            case "BLOCKED":
              throw new Error(
                "You have been blocked from accessing this content.",
              );
            default:
              throw new Error(
                misskeyError.message || `API Error: ${misskeyError.code}`,
              );
          }
        }

        throw err;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on authentication/authorization errors
      if (error instanceof Error) {
        if (
          error.message.includes("Authentication failed") ||
          error.message.includes("Access denied") ||
          error.message.includes("suspended") ||
          error.message.includes("blocked")
        ) {
          return false;
        }
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // if (isLoading) {
  //   return <Spinner size="sm" label="Loading notes..." />;
  // }
  //
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <Text className="text-center text-red-500">
          Error loading notes:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </Text>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  // Assuming the API returns an array of Note objects or similar structure
  const typedNotes = notes as Note[] | undefined;

  return <TimelineNotes notes={typedNotes} />;
}
