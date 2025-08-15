import { OllamaEmbeddings } from "@langchain/ollama";
import { Ollama } from "@langchain/ollama";
import { similarity } from "ml-distance";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import type { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

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
