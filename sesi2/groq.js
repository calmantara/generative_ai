const LLM_API_URL="https://api.groq.com/openai/v1/chat/completions";

export async function generate(prompt) {
    if (!prompt) throw new Error("Prompt is required");

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`,
    };

    const body = JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
            //{ role: "system", content: SYSTEM_MESSAGE },
            { role: "user", content: prompt },
        ],
        stop: "",
        temperature: 0,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
    });

    const request = {
        method: "POST",
        headers,
        body,
    };

    const res = await fetch(LLM_API_URL, request);
    const { choices } = await res.json();

    return choices[0].message?.content?.trim();
}
