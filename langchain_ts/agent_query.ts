import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { DynamicTool } from "@langchain/core/tools";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { ConsoleCallbackHandler } from "langchain/callbacks";
import {WikipediaQueryRun} from "@langchain/community/tools/wikipedia_query_run";


async function withAgent() {
    // Define a prompt template
    const currentTimeTools = new DynamicTool({
        name: "current_time",
        description: "Get the current time in UTC",
        func: async () => {
            return new Date().toISOString();
        }
    });

    const wikiTools = new WikipediaQueryRun({
        topKResults: 3,
        maxDocContentLength: 4000,
    });

    const tools = [currentTimeTools, wikiTools];
    // const outputParser = new StringOutputParser();

    const prompt = PromptTemplate.fromTemplate(`
        Answer the following questions as best you can. 
        You have access to the following tools:
        {tools}
        Use the following format:

        Question: the input question you must answer
        Thought: you should always think about what to do
        Action: the action to take, should be one of [{tool_names}]
        Action Input: the input to the action
        Observation: the result of the action
        ... (this Thought/Action/Action Input/Observation can repeat N times)
        Thought: I now know the final answer
        Final Answer: the final answer to the original input question

        Begin!

        Question: {input}
        Thought:{agent_scratchpad}

        Please answer the question using the tools provided 
        and return the final answer as a string.
    `);

    const agent = await createReactAgent({
        llm: model,
        prompt: prompt,
        tools: tools,
    });

    const executor = new AgentExecutor({
        agent: agent,
        tools: tools,
    });

    const response = await executor.invoke(
        {input: "Who won MotoGP world champion in 2024?"},
        {
            callbacks: [new ConsoleCallbackHandler()],
        }
    );

    console.log("Response:", response);
}

await withAgent();