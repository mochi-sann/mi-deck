export default {
  "mi-deck": {
    input: "./../server/.swagger/swagger-spec.yaml",
    output: {
      mode: "tags-split",
      target: "./src/lib/mideck/endpoints",
      schemas: "src/lib/mideck/models",
      httpClient: "fetch",
      client: "react-query",
      mock: true,
    },
  },
};
