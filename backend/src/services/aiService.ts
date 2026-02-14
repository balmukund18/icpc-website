import OpenAI from "openai";

// Groq uses an OpenAI-compatible API with ultra-fast LLaMA inference
const key = process.env.GROQ_API_KEY || "";
const client = key
  ? new OpenAI({
    apiKey: key,
    baseURL: "https://api.groq.com/openai/v1",
  })
  : null;

const SYSTEM_PROMPT = `You are an AI assistant for an ICPC (International Collegiate Programming Contest) portal. You help students with:
- Competitive programming concepts, algorithms, and data structures
- Problem-solving strategies and approaches
- Understanding LeetCode/HackerRank problems
- Contest preparation tips
- General coding questions in C++, Python, and Java
Keep responses concise, clear, and helpful. Use code examples when relevant. Format responses in markdown.`;

const TIMEOUT_MS = 15_000; // 15-second timeout

export const chat = async (prompt: string) => {
  if (!client) {
    return {
      reply: "AI chatbot is not configured. Please set the GROQ_API_KEY environment variable.",
    };
  }

  try {
    // AbortController for timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res: any = await client.chat.completions.create(
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      },
      { signal: controller.signal }
    );

    clearTimeout(timer);

    const content = res?.choices?.[0]?.message?.content || "";
    return { reply: content };
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.error("Groq request timed out after", TIMEOUT_MS, "ms");
      return { error: "Request timed out. Please try a shorter question." };
    }
    console.error("Groq AI error", err?.response?.data || err.message || err);
    return { error: "AI request failed. Please try again." };
  }
};
