import { Hono } from "hono";

// import { generate } from "./llm.js";
// import { generate } from "./groq.js";
import { reason } from "./reason.js";
import fs from "node:fs";

const app = new Hono();

app.get("/health", function (ctx) {
	return ctx.text("OK");
});
app.get("/chat", async function (ctx) {
	const inquiry = ctx.req.query("q");
	const response = await reason(inquiry);
	return ctx.text(response);
});
app.get("/", async function (ctx) {
	return ctx.html(fs.readFileSync("index.html"));
});

export default app;