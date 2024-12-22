import type React from "react";
import { $api } from "../lib/api/fetchClient";

export const TestComponet: React.FC = () => {
  const { isPending, error, data } = $api.useQuery("get", "/v1");

  if (isPending) return "Loading...";

  if (error) return `An error has occurred: ${JSON.stringify(error)}`;

  return <div>{JSON.stringify(data)}</div>;
};
