import { useQuery } from "@tanstack/react-query";
import { APIClient } from "misskey-js/api.js";
import type React from "react";
import { Suspense } from "react";
// export type MisskeyJsTestProps = {
//   // origin: string;
//   // credential: string;
// };

export const MisskeyJsTest: React.FC = () => {
  const client = new APIClient({
    origin: "http://localhost:3002",
    credential: "PK00RQIpfmS1diD38HCzB1Pmz055BvFG",
  });
  const { isPending, error, data } = useQuery({
    queryKey: ["timeline"],
    queryFn: async () => {
      return await client
        .request("notes/timeline", {})
        .then((res) => res)
        .catch((err) => {
          console.log(err);
        });
    },
  });
  return (
    <div>
      <Suspense fallback={<p>loading</p>}>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Suspense>
    </div>
  );
};
