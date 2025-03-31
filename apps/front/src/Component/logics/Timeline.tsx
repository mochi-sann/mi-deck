import { $api } from "@/lib/api/fetchClient";
import type React from "react";

export const Timeline: React.FC = () => {
  const { isPending, error, data } = $api.useQuery(
    "get",
    "/v1/timeline/{serverSerssionId}",
    {
      params: {
        path: {
          serverSerssionId: "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
        },
      },
    },
  );
  if (isPending) return "Loading...";

  if (error) return `An error has occurred: ${JSON.stringify(error)}`;
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
