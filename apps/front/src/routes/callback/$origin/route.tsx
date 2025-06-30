import { createFileRoute } from "@tanstack/react-router";
import * as v from "valibot";

export const Route = createFileRoute("/callback/$origin")({
  validateSearch: v.object({
    session: v.fallback(v.string(), ""),
  }),
});
