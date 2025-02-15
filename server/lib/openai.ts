import OpenAI from "openai";
import type { CryptoPrice, NewsArticle, TradingSignal, DailyAnalysis, AgentTask } from "../../client/src/lib/types";
import { getMarketPrices, getTechnicalIndicators } from "./market";
import { getLatestNews } from "./news";
import { db } from "@db";
import { messages } from "@db/schema";
import { eq } from "drizzle-orm";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI();

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
export async function processMessage(
  message: string,
  chatId: number
): Promise<{ message: string; cryptoData: CryptoPrice[]; newsData: NewsArticle[]; tasks?: AgentTask[] }> {
  try {
    const [cryptoData, newsData, technicalData] = await Promise.all([
      getMarketPrices(),
      getLatestNews(),
      getTechnicalIndicators("BTC")
    ]);

    const systemMessage = `You are a cryptocurrency trading analyst. Follow these rules strictly:

1. USE ONLY THE PROVIDED DATA. Do not invent or hallucinate prices or statistics.
2. Keep responses SHORT and ACTIONABLE - 2-4 bullet points or a brief paragraph.
3. Always include source attribution (e.g. "Source: CryptoCompare data")
4. Format trading suggestions as: "Symbol: Action @ Price, Stop: $X, Target: $Y (Confidence: High/Medium/Low)"
5. No lengthy disclaimers - just a brief "DYOR" if needed.
6. If technical terms used (RSI, MACD etc), explain briefly why they matter.

Response format:
• Current Market: 1-2 lines on key price/volume moves
• Trading Signal: Specific entry/exit levels with stop-loss
• Quick Rationale: Why this trade? (technical/volume/news)
• Risk Note: One line on key risk`;

    const prompt = `Analyze using ONLY this real-time data:

MARKET DATA (Source: CryptoCompare):
${cryptoData.map(coin => 
  `${coin.symbol}: $${coin.current_price.toLocaleString()}
   24h Change: ${coin.price_change_percentage_24h.toFixed(2)}%
   Volume: $${(coin.total_volume/1e6).toFixed(1)}M`
).join('\n')}

TECHNICAL INDICATORS:
RSI: ${technicalData.rsi || 'N/A'}
Volume Change: ${technicalData.volume_change_24h || 'N/A'}%
${technicalData.macd ? `MACD: ${technicalData.macd}` : ''}

RECENT NEWS:
${newsData.slice(0,2).map(article => `• ${article.title} (${article.source})`).join('\n')}

User Question: ${message}

Remember: Use ONLY above data. No price hallucination. Keep it brief and actionable.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content || "Unable to analyze at this time.";

    return {
      message: content,
      cryptoData: cryptoData.slice(0, 4),  // Only send top 4 coins data for display
      newsData: newsData.slice(0, 2)       // Only send 2 most recent news items
    };
  } catch (error) {
    console.error("Error processing message with OpenAI:", error);
    throw error instanceof Error 
      ? new Error(`Failed to process message: ${error.message}`)
      : new Error("Failed to process message with AI");
  }
}