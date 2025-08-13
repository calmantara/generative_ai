import { PromptTemplate} from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/ollama";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const model = new ChatOllama({
    model: "deepseek-r1",
    temperature: 0,
    topK: 3,
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
const pdfDoc = await pdfLoader("./document.pdf")
const chunked = await splitDoc(pdfDoc);

const summaryTemplate = `
You are an expert in summarizing documents. Your goal is to create a summary of a document. 
Below you find the content of the document:
--------
{text}
--------
The content of the document will also be used as the basis for a question-and-answer bot. 
Provide some example questions and answers that could be asked about the document. 
Make these questions very specific. 
The total output will be a summary of the document and a list of example questions the user could ask about the document.

SUMMARY AND QUESTIONS:
`;
const SUMMARY_PROMPT= PromptTemplate.fromTemplate(summaryTemplate);

const summaryRefineTemplate = `
You are an expert in summarizing documents. Your goal is to create a summary of a document.
We have provided an existing summary up to a certain point: {existing_answer}
Below you find the content of a document:
--------
{text}
--------
Given the new context, refine the summary and example questions.
The content of the document will also be used as the basis for a question-and-answer bot.
Provide some example questions and answers that could be asked about the document. Make these questions very specific.
If the context isn't useful, return the original summary and questions.
The total output will be a summary of the document and a list of example questions the user could ask about the document.

SUMMARY AND QUESTIONS:
`;
const SUMMARY_REFINE_PROMPT= PromptTemplate.fromTemplate(summaryRefineTemplate);

const summarizeChain = loadSummarizationChain(model, {
    type: "refine",
    questionPrompt: SUMMARY_PROMPT,
    refinePrompt: SUMMARY_REFINE_PROMPT,
    verbose: true,
});

const start = Date.now();
const summary = await summarizeChain.invoke({
    input_documents: chunked,
});
const duration = Date.now() - start;

// result 
console.log(summary);
console.log(" Duration: ", duration,"ms");