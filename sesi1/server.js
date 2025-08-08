import { serve } from "@hono/node-server";
import app from "./app.js";

// Patch global Response for Node 24+
if (typeof Response === 'undefined') {
  globalThis.Response = (await import('node-fetch')).Response;
}

serve({ fetch: app.fetch, port: 3000 });