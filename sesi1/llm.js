const LLM_API_URL = "http://localhost:11434/api/generate";

export async function generate(prompt) {
  if (!prompt) throw new Error("Prompt is required");

  const method = "POST";
  const headers = {
    "Content-Type": "application/json"
  };
  const body = JSON.stringify({
    model: "deepseek-r1",
    prompt,
    options: {
      temperature: 0,
      top_k: 20
    },
    stream: false
  });
  const request = { method, headers, body };
  const res = await fetch(LLM_API_URL, request);
  const { response } = await res.json();

  const finalResponse = response.trim().split("</think>")[1].trim();

  return finalResponse;
}
