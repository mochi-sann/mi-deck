import { useQuery } from "@tanstack/react-query";
import type React from "react";

export const TestComponet: React.FC = () => {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["repoData"],
    queryFn: async () => {
      const response = await fetch("/api");
      return await response.json();
    },
  });

  if (isPending) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  return <div>{JSON.stringify(data)}</div>;
};
