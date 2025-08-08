import { Hono } from "hono";

import { reason } from "./llm.js";
import fs from "node:fs";

const app = new Hono();

const HISTORY = [];

app.get("/health", function (ctx) {
	return ctx.text("OK");
});
app.get("/chat", async function (ctx) {
	const inquiry = ctx.req.query("q");
	console.log("Waiting for LLM...");
	const {answer, observation} = await reason(HISTORY, `Question: ${inquiry}`);
	console.log("LLM answers:", answer);
	HISTORY.push(`Question: ${inquiry}`);
	HISTORY.push(`Observation: ${observation}`);
	HISTORY.push(`Answer: ${answer}`);
	return ctx.text(answer);
});
app.get("/", async function (ctx) {
	return ctx.html(fs.readFileSync("index.html"));
});

export default app;