// chat prompt
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";

const model = new ChatOllama({
    model: "deepseek-r1",
    temperature: 0,
    topK: 3,
});

const template = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant."],
    new MessagesPlaceholder("msgs")
]);

const response = await template.pipe(model).invoke({
    msgs: [
        new HumanMessage(
        {
            content: "What is the capital of France?",
        }
        ),
    ],
});

const parser = "</think>"
const parsedResponse = response.text.split(parser);
if (parsedResponse.length > 1) {
    console.log("Answer:", parsedResponse[1].trim());
}