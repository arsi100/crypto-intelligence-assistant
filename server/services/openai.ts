import OpenAI from "openai";
import { getTopCoins, getCoinHistory, type CoinData } from "./coingecko";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
export async function analyzeCrypto(prompt: string, context: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    // Fetch real-time market data
    const marketData = await getTopCoins(10);

    // Format market data for context
    const marketContext = marketData.map(coin => (
      `${coin.name} (${coin.symbol.toUpperCase()}): $${coin.current_price.toLocaleString()}, ` +
      `24h Change: ${coin.price_change_percentage_24h.toFixed(2)}%, ` +
      `Market Cap: $${coin.market_cap.toLocaleString()}`
    )).join('\n');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a crypto trading assistant. Base your analysis ONLY on the following real-time market data:\n\n${marketContext}\n\nDo not make up any data or reference external sources like Twitter or forums. Only analyze the provided market data.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content || "Sorry, I couldn't analyze that.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to get AI analysis: ${(error as Error).message}`);
  }
}