// import { generate } from "./groq.js";
import { generate } from "./llm.js";
import { act } from "./action.js";
import { finalPrompt } from "./final-prompt.js";

const SYSTEM_MESSAGE = `
You run in a process of Question, Thought, Action, Observation.
Use Thought to describe your thoughts about the question you have been asked.
Observation will be the result of running those actions.
If you cannot answer the question from your memory, use Action to run one of these actions available to you:
- exchange: e.g. exchange: USD EUR
    Return the exchange rate between two currencies.
If you can answer, use Answer to provide the response to the question.

Here are some sample sessions.
Question: What is capital of france?
Thought: This is about geography, I can recall the answer from my memory.
Action: capital of France.
Observation: Paris is the capital of France.
Answer: The capital of France is Paris.

Question: Who painted Mona Lisa?
Thought: This is about general knowledge, I can recall the answer from my memory.
Action: painter of Mona Lisa.
Observation: Mona Lisa was painted by Leonardo da Vinci.
Answer: Leonardo da Vinci painted Mona Lisa.

Question: I have 10 Yuan, how much it is in IDR?
Thought: This is about currency conversion, I need to check the current rate.
Action: exchange: CNY IDR
Observation: As per Tue, 13 Aug 2024 00:02:31 +0000, 1 CNY equal to 2224 IDR.
Answer: You've got 22,240 IDR.

Let's go!
`;

export async function reason(inquiry) {
    const prompt = `${SYSTEM_MESSAGE}\n\n${inquiry}`;
    const response = await generate(prompt);

    console.log(`----------\n${response}\n----------`);

    let conclusion = "";
    const action = await act(response);

    if (action === null) {
        return answer(response);
    }

    console.log("REASON result:", action.result);

    conclusion = await generate(finalPrompt(inquiry, action.result));
    return conclusion;
}