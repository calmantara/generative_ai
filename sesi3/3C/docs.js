// import { readPdfPages } from "pdf-text-reader";

// const FEATURE_MODEL = "Xenova/paraphrase-MiniLM-L3-v2";

// export function pdfObjectToPages(pdfObject) {
// 	const pages = pdfObject.map((page, number) => {
// 		return { number, content: page.lines.join(" ") };
// 	});
// 	return pages;
// }

// export function sequence(n) {
// 	return Array.from({ length: n }, (_, i) => i);
// }

// export function pagesToPagination(pages) {
// 	return sequence(pages.length).map((k) =>
// 		pages.slice(0, k + 1).reduce((loc, page) => loc + page.content.length, 0),
// 	);
// }

// export function split(text) {
// 	const isPunctuator = (ch) => ch === "." || ch === "!" || ch === "?";
// 	const isWhiteSpace = (ch) => ch === " " || ch === "\n" || ch === "\t";

// 	const chunks = [];
// 	let str = "";
// 	let offset = 0;
// 	for (let i = 0; i < text.length; ++i) {
// 		const ch1 = text[i];
// 		const ch2 = text[i + 1];
// 		if (isPunctuator(ch1) && isWhiteSpace(ch2)) {
// 			str += ch1;
// 			const text = str.trim();
// 			chunks.push({ offset, text });
// 			str = "";
// 			offset = i + 1;
// 			continue;
// 		}
// 		str += ch1;
// 	}
// 	if (str.length > 0) {
// 		chunks.push({ offset, text: str.trim() });
// 	}
// 	return chunks;
// }

// export async function vectorize(text) {
// 	const transformers = await import("@xenova/transformers");
// 	const { pipeline } = transformers;
// 	const extractor = await pipeline("feature-extraction", FEATURE_MODEL, {
// 		quantized: true,
// 	});

// 	const chunks = split(text);
// 	const result = [];
// 	for (let index = 0; index < chunks.length; index++) {
// 		const { offset } = chunks[index];
// 		const sentence = chunks
// 			.slice(index, index + 3)
// 			.map(({ text }) => text)
// 			.join(" ");
// 		const output = await extractor([sentence], {
// 			pooling: "mean",
// 			normalize: true,
// 		});
// 		result.push({ index, offset, sentence, vector: output[0].data });
// 	}
// 	return result;
// }

// export const paginate = (entries, pagination) =>
// 	entries.map((entry) => {
// 		const { offset } = entry;
// 		const page = pagination.findIndex((i) => i > offset);
// 		return { page, ...entry };
// 	});

// export async function ingest(url) {
// 	console.log("INGEST:");
// 	const input = await readPdfPages({ url });
// 	console.log(" url:", url);
// 	const pages = pdfObjectToPages(input);
// 	console.log(" pages count:", pages.length);
// 	const pagination = pagesToPagination(pages);
// 	const text = pages.map((page) => page.content).join(" ");
// 	const start = Date.now();
// 	const document = paginate(await vectorize(text), pagination);
// 	const elapsed = Date.now() - start;
// 	console.log(" vectorization time:", elapsed, "ms");
// 	console.info(" Ingestion finish.");

// 	return document;
// }

// import fs from "fs";
// import PDFParser from "pdf2json";

// // --- Extract pages with pdf2json (Promise)
// export function extractPages(filePath) {
//   return new Promise((resolve, reject) => {
//     const pdfParser = new PDFParser();
//     pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
//     pdfParser.on("pdfParser_dataReady", pdfData => {
//       // Per halaman, gabungkan semua text
//       const pages = pdfData.FormImage.Pages.map((pageObj, idx) => {
//         const content = pageObj.Texts.map(t =>
//           decodeURIComponent(t.R[0].T)
//         ).join(" ");
//         return { number: idx, content };
//       });
//       resolve(pages);
//     });
//     pdfParser.loadPDF(filePath);
//   });
// }

// export function sequence(n) {
//   return Array.from({ length: n }, (_, i) => i);
// }

// export function pagesToPagination(pages) {
//   return sequence(pages.length).map((k) =>
//     pages.slice(0, k + 1).reduce((loc, page) => loc + page.content.length, 0),
//   );
// }

// export function split(text) {
//   const isPunctuator = (ch) => ch === "." || ch === "!" || ch === "?";
//   const isWhiteSpace = (ch) => ch === " " || ch === "\n" || ch === "\t";

//   const chunks = [];
//   let str = "";
//   let offset = 0;
//   for (let i = 0; i < text.length; ++i) {
//     const ch1 = text[i];
//     const ch2 = text[i + 1];
//     if (isPunctuator(ch1) && isWhiteSpace(ch2)) {
//       str += ch1;
//       const text = str.trim();
//       chunks.push({ offset, text });
//       str = "";
//       offset = i + 1;
//       continue;
//     }
//     str += ch1;
//   }
//   if (str.length > 0) {
//     chunks.push({ offset, text: str.trim() });
//   }
//   return chunks;
// }

// export async function vectorize(text) {
//   const transformers = await import("@xenova/transformers");
//   const { pipeline } = transformers;
//   const extractor = await pipeline(
//     "feature-extraction",
//     "Xenova/paraphrase-MiniLM-L3-v2", // Atau L6-v2 jika ingin
//     {
//       quantized: true,
//     }
//   );

//   const chunks = split(text);
//   const result = [];
//   for (let index = 0; index < chunks.length; index++) {
//     const { offset } = chunks[index];
//     const sentence = chunks
//       .slice(index, index + 3)
//       .map(({ text }) => text)
//       .join(" ");
//     const output = await extractor([sentence], {
//       pooling: "mean",
//       normalize: true,
//     });
//     result.push({ index, offset, sentence, vector: output[0].data });
//   }
//   return result;
// }

// export const paginate = (entries, pagination) =>
//   entries.map((entry) => {
//     const { offset } = entry;
//     const page = pagination.findIndex((i) => i > offset);
//     return { page, ...entry };
//   });

// export async function ingest(filePath) {
//   console.log("INGEST:");
//   const pages = await extractPages(filePath);
//   console.log(" file:", filePath);
//   console.log(" pages count:", pages.length);
//   const pagination = pagesToPagination(pages);
//   const text = pages.map((page) => page.content).join(" ");
//   const start = Date.now();
//   const document = paginate(await vectorize(text), pagination);
//   const elapsed = Date.now() - start;
//   console.log(" vectorization time:", elapsed, "ms");
//   console.info(" Ingestion finish.");
//   return document;
// }

// // Untuk testing via CLI:
// if (process.argv[1].endsWith("docs.js") && process.argv[2]) {
//   ingest(process.argv[2]).then(result => {
//     console.log("Result:", JSON.stringify(result, null, 2));
//   }).catch(console.error);
// }

import extract from "pdf-text-extract";

// Fungsi untuk ekstrak text per halaman dari PDF
export async function extractPages(filePath) {
  return new Promise((resolve, reject) => {
    extract(filePath, (err, pages) => {
      if (err) return reject(err);
      // pages: array of strings, 1 per halaman
      resolve(pages.map((content, number) => ({
        number,
        content: content.trim(),
      })));
    });
  });
}

export function sequence(n) {
  return Array.from({ length: n }, (_, i) => i);
}

export function pagesToPagination(pages) {
  return sequence(pages.length).map((k) =>
    pages.slice(0, k + 1).reduce((loc, page) => loc + page.content.length, 0),
  );
}

export function split(text) {
  const isPunctuator = (ch) => ch === "." || ch === "!" || ch === "?";
  const isWhiteSpace = (ch) => ch === " " || ch === "\n" || ch === "\t";

  const chunks = [];
  let str = "";
  let offset = 0;
  for (let i = 0; i < text.length; ++i) {
    const ch1 = text[i];
    const ch2 = text[i + 1];
    if (isPunctuator(ch1) && isWhiteSpace(ch2)) {
      str += ch1;
      const text = str.trim();
      chunks.push({ offset, text });
      str = "";
      offset = i + 1;
      continue;
    }
    str += ch1;
  }
  if (str.length > 0) {
    chunks.push({ offset, text: str.trim() });
  }
  return chunks;
}

export async function vectorize(text) {
  const transformers = await import("@xenova/transformers");
  const { pipeline } = transformers;
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/paraphrase-MiniLM-L3-v2",
    { quantized: true }
  );

  const chunks = split(text);
  const result = [];
  for (let index = 0; index < chunks.length; index++) {
    const { offset } = chunks[index];
    const sentence = chunks
      .slice(index, index + 3)
      .map(({ text }) => text)
      .join(" ");
    const output = await extractor([sentence], {
      pooling: "mean",
      normalize: true,
    });
    result.push({ index, offset, sentence, vector: output[0].data });
  }
  return result;
}

export const paginate = (entries, pagination) =>
  entries.map((entry) => {
    const { offset } = entry;
    const page = pagination.findIndex((i) => i > offset);
    return { page, ...entry };
  });

export async function ingest(filePath) {
  console.log("INGEST:");
  const pages = await extractPages(filePath);
  console.log(" file:", filePath);
  console.log(" pages count:", pages.length);
  const pagination = pagesToPagination(pages);
  const text = pages.map((page) => page.content).join(" ");
  const start = Date.now();
  const document = paginate(await vectorize(text), pagination);
  const elapsed = Date.now() - start;
  console.log(" vectorization time:", elapsed, "ms");
  console.info(" Ingestion finish.");
  return document;
}

// Untuk testing via CLI:
if (process.argv[1].endsWith("docs.js") && process.argv[2]) {
  ingest(process.argv[2]).then(result => {
    console.log("Result:", JSON.stringify(result, null, 2));
  }).catch(console.error);
}

