import { OllamaEmbeddings } from "@langchain/ollama";

const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
});

console.log(await embeddings.embedQuery("Hello world!"));

import {similarity} from "ml-distance";

const vector1 = await embeddings.embedQuery("cat");
const vector2 = await embeddings.embedQuery("dog");
const similarityScore = similarity.cosine(vector1, vector2);
console.log("Cosine similarity between 'cat' and 'dog':", similarityScore);

const vector3 = await embeddings.embedQuery("teacher");
const similarityScore2 = similarity.cosine(vector1, vector3);
console.log("Cosine similarity between 'cat' and 'teacher':", similarityScore2);

