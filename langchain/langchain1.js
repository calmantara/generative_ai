import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {ChatOllama} from "@langchain/ollama";

const model = new ChatOllama({
    model: "deepseek-r1",
    temperature: 0,
    topK: 3,
});

const response = await model.invoke([
    new SystemMessage("You are a helpful assistant."),
    new HumanMessage("What is the capital of France?"),
]);

const parser = "</think>"
const parsedResponse = response.text.split(parser);
if (parsedResponse.length > 1) {
    console.log("Answer:", parsedResponse[1].trim());
}