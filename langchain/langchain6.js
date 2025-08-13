// chat prompt
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { JsonOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOllama({
    model: "deepseek-r1",
    temperature: 0,
    topK: 3,
});

const template = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant."],
    new MessagesPlaceholder("msgs")
]);

// interface Capital {
//     country: string;
//     fact: string;
// };

const parser = new JsonOutputParser({
    outputSchema: {
        type: "object",
        properties: {
            country: { type: "string" },
            fact: { type: "string" }
        },
        required: ["country", "fact"]
    }
});

const response = await template.pipe(model).pipe(parser).invoke({
    msgs: [
        new HumanMessage(
        {
            content: "What is the capital of France?",
        }
        ),
    ],
});

console.log("Parsed Response:", response);