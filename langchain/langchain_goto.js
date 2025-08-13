import { OllamaEmbeddings } from "@langchain/ollama";
import {similarity} from "ml-distance";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
});


async function pdfLoader(path){
    const pdf = new PDFLoader(path);

    return await pdf.load();
}

async function splitDoc(docs) {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    return await splitter.splitDocuments(docs);
}

// open pdf
const pdfDoc = await pdfLoader("./document.pdf");
const chunked = await splitDoc(pdfDoc);

const vectorStore = new MemoryVectorStore(embeddings);
await vectorStore.addDocuments(chunked);

const retriever = vectorStore.asRetriever();
console.log("Retriever :", await retriever.invoke("What is the revenue of GoTo Group in Q3 2022?"));

const retrievedDocs = await vectorStore.similaritySearch(
    "How much revenue GoTo Group in Q3 2022?", 
    3,
);

const pages = retrievedDocs.map(doc => doc.pageContent).join("\n\n");
console.log("Retrieved pages:\n", pages);