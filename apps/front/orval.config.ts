export default {
  "mi-deck": {
    input: "./../server/.swagger/swagger-spec.yaml",
    output: {
      mode: "tags-split",
      target: "./src/lib/mideck/endpoints",
      schemas: "src/lib/mideck/models",
      client: "react-query",
      headers: true,
      baseUrl: "http://localhost:3000/",
      override: {
        mutator: {
          path: "./src/lib/mideck/mutator/custom-instance.ts",
          name: "customFetch",
        },
        query: {
          useQuery: true,
          useInfinite: true,
          useInfiniteQueryParam: "page",
          options: {
            staleTime: 10000,
          },
        },
      },
    },
  },
};
