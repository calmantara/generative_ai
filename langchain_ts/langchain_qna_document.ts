import { OllamaEmbeddings } from "@langchain/ollama";
import { Ollama } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import type { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { MessagesPlaceholder, ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import * as readline from 'readline';
import { ChatMessageHistory } from "langchain/memory";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { randomUUID } from "crypto";


const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
});

const model = new Ollama({
    model: "deepseek-r1",
    temperature: 0,
    topK: 3,
});

async function splitDocument(filePath: string): Promise<Document[]> {
    const loader = new PDFLoader(filePath);
    const rawDocs = await loader.load();
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    
    return textSplitter.splitDocuments(rawDocs);
}

const vectorStore = new MemoryVectorStore(embeddings);
async function vectorizeDocument(docs: Document[]): Promise<VectorStoreRetriever>{
    await vectorStore.addDocuments(docs);

    return vectorStore.asRetriever();
}

async function queryDocument(retriever: VectorStoreRetriever, query: string): Promise<string> {
    // check similarity
    const results = await retriever.invoke(query);

    if (results.length === 0) {
        console.log("No relevant documents found.");
        return ""; 
    }
    // fetch all contents
    const contents = results.map(doc => `<doc>\n${doc.pageContent}\n</doc>`);

    return contents.join("\n");
}

interface Response {
    answer: string;
    sources: string[];  
}

async function askQuestion(qn: string, session: string, history: ChatMessageHistory, retriever: VectorStoreRetriever): Promise<Response> {
    const context = await queryDocument(retriever, qn);
    
    const contextTemplate = `
        You are an experienced researcher, expert at interpreting and answering questions based on provided sources.
        Using the provided context, answer the user's question to the best of your ability using only the resources provided.
        Be verbose!

        <context>{context}</context>
        
        Now, answer this question using the above context and return a JSON object with the following fields:
        - answer: The answer to the question, in string type.
        - sources: An array of sources used to answer the question, in array of string. 
    `;

    // historical chat context
    const chatPrompt = ChatPromptTemplate.fromMessages([
        ["system", contextTemplate],
        new MessagesPlaceholder("history"),
        ["human", "{question}"]
    ]);
    const partialPrompt = await chatPrompt.partial({
        context: context,
    });


    // Initialize the LLM
    const responseParser = new JsonOutputParser<Response>();
    const chain = partialPrompt.pipe(model).pipe(responseParser);

    const chainWithHistory = new RunnableWithMessageHistory({
        runnable: chain,
        getMessageHistory: (session) => history,
        inputMessagesKey: "question",
        historyMessagesKey: "history",
        outputMessagesKey: "answer",
    })

    const response = await chainWithHistory.invoke(
        { question: qn },
        { configurable: { sessionId: session } }
    );

    return response;
}

async function main() {
    
    const filePath = "./document.pdf";
    const documents = await splitDocument(filePath);
    const retriever = await vectorizeDocument(documents);

    // history and session
    const session = randomUUID();
    const history = new ChatMessageHistory();

    while (true) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const qn = await new Promise<string>((resolve) => {
            rl.question("question: ", (answer: string) => {
                rl.close();
                resolve(answer);
            });
        });
        if (!qn) {
            console.log("No question provided. Exiting...");
            
            return
        }

        const res = await askQuestion(qn, session, history, retriever)
        console.log("answer:", res.answer);
        console.log("======================================");
    }

}

main();