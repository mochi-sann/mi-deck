module.exports = {
  "mi-deck": {
    input: "./../server/.swagger/swagger-spec.yaml",
    output: {
      mode: "single",
      target: "./src/lib/mideck/api.ts",
      schemas: "src/lib/mideck/models",
      client: "react-query",
      mock: true,
    },
  },
};
