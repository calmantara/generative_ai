// import { exchange } from "./exchange.js";

// const LLM_API_URL = "http://localhost:11434/api/generate";

// const SYSTEM_MESSAGE = `You run in a process of Question, Thought, Action, Observation.

// Use Thought to describe your thoughts about the question you have been asked.
// Observation will be the result of running those actions.

// If you can not answer the question from your memory, use Action to run one of these actions available to you:

// - If the question is about currency, use exchange: from to
// - Otherwise, use lookup: terms

// Finally at the end, state the Answer.

// Here are some sample sessions.

// Question: What is capital of france?
// Thought: This is about geography, I can recall the answer from my memory.
// Action: lookup: capital of France.
// Observation: Paris is the capital of France.
// Answer: The capital of France is Paris.

// Question: Who painted Mona Lisa?
// Thought: This is about general knowledge, I can recall the answer from my memory.
// Action: lookup: painter of Mona Lisa.
// Observation: Mona Lisa was painted by Leonardo da Vinci.
// Answer: Leonardo da Vinci painted Mona Lisa.

// Question: What is the exchange rate from USD to EUR?
// Thought: This is about currency exchange rates, I need to check the current rate.
// Action: exchange: USD EUR
// Observation: 0.8276 EUR for 1 USD.
// Answer: The current exchange rate is 0.8276 EUR for 1 USD.
// `;

// export async function answer(text) {
// 	const MARKER = "Answer:";
// 	const pos = text.lastIndexOf(MARKER);
// 	if (pos < 0) return "?";
// 	const answer = text.substr(pos + MARKER.length).trim();
// 	return answer;
// }

// export async function think(inquiry) {
// 	const prompt = `${SYSTEM_MESSAGE}\n\n${inquiry}`;
// 	const response = await generate(prompt);
// 	console.log("Response:", response);
// 	return answer(response);
// }

// export async function act(text) {
// 	const MARKER = "Action:";
// 	const pos = text.lastIndexOf(MARKER);
// 	if (pos < 0) return null;

// 	const subtext = `${text.substr(pos)} + \n`;
// 	const matches = /Action:\s*(.*?)\n/.exec(subtext);
// 	const action = matches[1];
// 	if (!action) return null;

// 	const SEPARATOR = ":";
// 	const sep = action.indexOf(SEPARATOR);
// 	if (sep < 0) return null;

// 	const fnName = action.substring(0, sep);
// 	const fnArgs = action
// 		.substring(sep + 1)
// 		.trim()
// 		.split(" ");

// 	if (fnName === "lookup") return null;
// 	if (fnName === "exchange") {
// 		const result = await exchange(fnArgs[0], fnArgs[1]);
// 		console.log("ACT: exchange", { args: fnArgs, result });
// 		return { action, name: fnName, args: fnArgs, result };
// 	}
// 	console.log("Not recognized action:", { action, name: fnName, args: fnArgs });
// }

// export function finalPrompt(inquiry, observation) {
// 	return `${inquiry}
// Observation: ${observation}
// Thought: Now I have the answer.
// Answer:`;
// }

// export async function reason(history, inquiry) {
// 	const prompt = `${SYSTEM_MESSAGE}\n\n${context(history)}\n\n${inquiry}`;
// 	console.log(prompt);
// 	const response = await generate(prompt);
// 	console.log(`----------\n${response}\n----------`);

// 	let conclusion = "";
// 	const action = await act(response);
// 	if (action === null) {
// 		return answer(response);
// 	}

// 	console.log("REASON result:", action.result);
// 	conclusion = await generate(finalPrompt(inquiry, action.result));
// 	return conclusion;
// }

// const HISTORY_MSG =
// 	"Before formulating a thought, consider the following conversation history.";

// export function context(history) {
// 	if (history.length > 0) {
// 		const recents = history.slice(-3 * 2); // only last 3 Q&A
// 		return `${HISTORY_MSG}\n\n${recents.join("\n")}`;
// 	}
// 	return "";
// }

// export async function generate(prompt) {
// 	if (!prompt) throw new Error("Prompt is required");

// 	const method = "POST";
// 	const headers = {
// 		"Content-Type": "application/json",
// 	};
// 	const body = JSON.stringify({
// 		model: "mistral-openorca",
// 		prompt,
// 		options: {
// 			num_predict: 200,
// 			temperature: 0,
// 			top_k: 20,
// 		},
// 		stream: false,
// 	});
// 	const request = { method, headers, body };
// 	const res = await fetch(LLM_API_URL, request);
// 	const { response } = await res.json();

// 	return response?.trim();
// }

import { exchange } from "./exchange.js";

const LLM_API_URL = "http://localhost:11434/api/generate";

const SYSTEM_MESSAGE = `You run in a process of Question, Thought, Action, Observation, Answer.

Use Thought to describe your thoughts about the question you have been asked.
Observation will be the result of running those actions.

If you can not answer the question from your memory, use Action to run one of these actions available to you:

- If the question is about currency, use exchange: from to
- Otherwise, use lookup: terms

Finally at the end, state the Answer.

Here are some sample sessions.

Question: Hello, my name is Budi
Thought: This is a personal introduction.
Action: lookup: Name Budi
Observation: Your name is Budi.
Answer: Hello Budi, nice to meet you!

Question: Who is my name?
Thought: This is a personal question, I can recall the answer from my memory
Action: lookup: Name Budi
Observation: Your name is Budi.
Answer: You name is Budi
`;

// Robust answer extraction
export async function answer(text) {
	const MARKER = "Answer:";
	if (!text) {
		console.warn("Warning: LLM response is empty/undefined in answer()");
		return "?";
	}
	const pos = text.lastIndexOf(MARKER);
	if (pos < 0) return "?";
	const answer = text.substr(pos + MARKER.length).trim();
	return answer;
}

// Run prompt with full system message, then extract answer
export async function think(inquiry) {
	const prompt = `${SYSTEM_MESSAGE}\n\n${inquiry}`;
	const response = await generate(prompt);
	console.log("Response:", response);
	return answer(response);
}

// Extract and run LLM Action
export async function act(text) {
	const MARKER = "Action:";
	if (!text) {
		console.warn("Warning: LLM response is empty/undefined in act()");
		return null;
	}
	const pos = text.lastIndexOf(MARKER);
	if (pos < 0) return null;

	const subtext = `${text.substr(pos)}\n`;
	const matches = /Action:\s*(.*?)\n/.exec(subtext);
	const action = matches && matches[1] ? matches[1] : null;
	if (!action) return null;

	const SEPARATOR = ":";
	const sep = action.indexOf(SEPARATOR);
	if (sep < 0) return null;

	const fnName = action.substring(0, sep);
	const fnArgs = action
		.substring(sep + 1)
		.trim()
		.split(" ")
		.filter(Boolean);
	const fnNameLower = fnName.toLowerCase();

	if (fnNameLower === "lookup") return null;
	if (fnNameLower === "exchange" && fnArgs.length >= 2) {
		const result = await exchange(fnArgs[0], fnArgs[1]);
		console.log("ACT: exchange", { args: fnArgs, result });
		return { action, name: fnName, args: fnArgs, result };
	}
	console.log("Not recognized action:", { action, name: fnName, args: fnArgs });
	return null;
}

// Compose prompt for final answer after getting observation
export function finalPrompt(inquiry, observation) {
	return `${inquiry}
Observation: ${observation}
Thought: Now I have the answer.
Answer:`;
}

export async function observation(text) {
	const MARKER = "Observation:";
	if (!text) {
		console.warn("Warning: LLM response is empty/undefined in act()");
		return null;
	}
	const pos = text.lastIndexOf(MARKER);
	if (pos < 0) return null;

	const subtext = `${text.substr(pos)}\n`;
	const matches = /Observation:\s*(.*?)\n/.exec(subtext);
	const obv = matches && matches[1] ? matches[1] : null;
	
	return obv
}

// Core reasoning: manage action and fallback
export async function reason(history, inquiry) {
	const historicalContext = context(history);
	const prompt = `${SYSTEM_MESSAGE}\n\n${historicalContext}\n\n${inquiry}`;
	console.log(prompt);
	const response = await generate(prompt);
	console.log(`----------\n${response}\n----------`);

	// observation
	const obv = await observation(response);
	
	let conclusion = "";
	const action = await act(response);
	if (action === null) {
		return {answer: await answer(response), observation: obv};
	}

	console.log("REASON result:", action.result);
	conclusion = await generate(finalPrompt(inquiry, action.result));
	return { answer: conclusion, observation: obv  };
}

const HISTORY_MSG =
	"Before formulating a thought, consider the following conversation history.";

// Compose history context for LLM
export function context(history) {
	if (history && history.length > 0) {
		const recents = history.slice(-3 * 3); // only last 3 Q&A
		return `${HISTORY_MSG}\n\n${recents.join("\n")}`;
	}
	return "";
}

// Robust generate for Ollama
export async function generate(prompt) {
	if (!prompt) throw new Error("Prompt is required");
	const method = "POST";
	const headers = {
		"Content-Type": "application/json",
	};
	const body = JSON.stringify({
		// model: "mistral-openorca",
		model: "orca-mini",
		// model: "deepseek-r1",
		prompt,
		options: {
			// num_predict: 200,
			temperature: 1	,
			top_k: 20,
		},
		stream: false,
	});
	const request = { method, headers, body };
	try {
		const res = await fetch(LLM_API_URL, request);
		const json = await res.json();
		// Robust extraction for Ollama and fallback (modify as needed for different backends)
		const respText =
			(typeof json === "string" && json) ||
			json.response ||
			json.choices?.[0]?.message?.content ||
			JSON.stringify(json);
		return respText?.trim();
	} catch (err) {
		console.error("LLM fetch/generate failed:", err);
		return "";
	}
}
