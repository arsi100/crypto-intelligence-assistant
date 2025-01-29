import OpenAI from "openai";
import type { CryptoPrice, NewsArticle } from "../../client/src/lib/types";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI();

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export async function processMessage(
  message: string,
  cryptoData: CryptoPrice[],
  newsData: NewsArticle[]
): Promise<{ message: string; cryptoData: CryptoPrice[]; newsData: NewsArticle[] }> {
  try {
    const systemMessage = `You are a cryptocurrency expert assistant. Your role is to:
1. Provide market insights based on real-time crypto prices
2. Share relevant news updates
3. Answer questions about cryptocurrency trends
4. Give clear, concise explanations
Keep responses focused and informative.`;

    const prompt = `Analyze this user message and provide insights using the current market data and news:

User message: ${message}

Current crypto prices:
${cryptoData.map(crypto => 
  `${crypto.name} (${crypto.symbol}): $${crypto.current_price} (${crypto.price_change_percentage_24h.toFixed(2)}% 24h)`
).join('\n')}

Latest news:
${newsData.map(article => 
  `- ${article.title} (${article.source})`
).join('\n')}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    if (!response.choices[0].message.content) {
      throw new Error("No response from AI");
    }

    return {
      message: response.choices[0].message.content,
      cryptoData,
      newsData,
    };
  } catch (error) {
    console.error("Error processing message with OpenAI:", error);
    throw new Error("Failed to process message with AI");
  }
}