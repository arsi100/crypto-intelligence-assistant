import OpenAI from "openai";
import type { CryptoPrice, NewsArticle } from "../../client/src/lib/types";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export async function processMessage(
  message: string,
  cryptoData: CryptoPrice[],
  newsData: NewsArticle[]
) {
  const prompt = `
You are a cryptocurrency expert assistant. Analyze the following user message and provide insights based on the current market data and news.

User message: ${message}

Current crypto prices:
${JSON.stringify(cryptoData, null, 2)}

Latest news:
${JSON.stringify(newsData, null, 2)}

Provide a helpful, concise response that addresses the user's query and incorporates relevant market data and news.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  return {
    message: response.choices[0].message.content,
    cryptoData,
    newsData,
  };
}
