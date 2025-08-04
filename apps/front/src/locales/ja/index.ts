import auth from "./auth.json";
import common from "./common.json";
import notes from "./notes.json";
import server from "./server.json";
import settings from "./settings.json";
import timeline from "./timeline.json";

export default {
  auth,
  common,
  timeline,
  settings,
  server,
  notes,
} as const;
