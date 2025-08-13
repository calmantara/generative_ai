// prompt template
// string prompt
import { PromptTemplate } from "@langchain/core/prompts";
import {ChatOllama} from "@langchain/ollama";

const model = new ChatOllama({
    model: "deepseek-r1",
    temperature: 0,
    topK: 3,
});


const template = PromptTemplate.fromTemplate(
    "What is the capital of {country}?"
);

const finalPrompt = await template.invoke({
    country: "France"
});
const response = await model.invoke(finalPrompt);

const parser = "</think>"
const parsedResponse = response.text.split(parser);
if (parsedResponse.length > 1) {
    console.log("Answer:", parsedResponse[1].trim());
}