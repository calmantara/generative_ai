import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";
import { JsonOutputParser } from "@langchain/core/output_parsers";

// Initialize the LLM
const model = new ChatOllama({
    model: "deepseek-r1", 
    temperature: 0,
    topK: 3,
});

// Define a prompt template
const prompt = `
Extract the following information from the text:
- Name
- Age
- Email

Text: {inputText}

Response with a valid JSON object, containing three fields: 'name', 'email' and 'age' in integer.
`;

const template = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant."],
    ["human", prompt]
]);


// Create a JSON parser
interface ParsedData {
    Name: string;
    Age: number;
    Email: string;
}

const jsonParser = new JsonOutputParser<ParsedData>();

// Run the chain
async function run() {
    const inputText = "John Doe is 29 years old and can be reached at john.doe@example.com.";
    try {
        const response = await template.pipe(model).pipe(jsonParser).invoke(
            {
                inputText: inputText,
            }
        );
        console.log("Parsed JSON:", response);
    } catch (error) {
        console.error("Error:", error);
    }
}

run();