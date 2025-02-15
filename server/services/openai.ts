import OpenAI from "openai";
import type { CryptoPrice, NewsArticle, TradingSignal, DailyAnalysis, AgentTask } from "../../client/src/lib/types";
import { getMarketPrices, getTechnicalIndicators } from "./market";
import { getLatestNews } from "./news";
import { getFearGreedIndex } from "./aggregators/fearGreed";
import { db } from "@db";
import { messages } from "@db/schema";
import { eq } from "drizzle-orm";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI();

export interface SentimentResult {
  rating: number;  // Normalized score between -1 and 1
  confidence: number;
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a sentiment analysis expert. Analyze the given text and return a sentiment score between -1 (very negative) and 1 (very positive). Focus on cryptocurrency market sentiment.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Extract numeric score from the response
    const score = parseFloat(content);
    return {
      rating: Math.max(-1, Math.min(1, score)), // Ensure score is between -1 and 1
      confidence: 0.8 // Default confidence level
    };
  } catch (error) {
    console.error("Error in sentiment analysis:", error);
    return {
      rating: 0,
      confidence: 0
    };
  }
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
export async function processMessage(
  message: string,
  chatId: number
): Promise<{ message: string; cryptoData: CryptoPrice[]; newsData: NewsArticle[]; tasks?: AgentTask[] }> {
  try {
    const [cryptoData, newsData, technicalData, fearGreedData] = await Promise.all([
      getMarketPrices(),
      getLatestNews(),
      getTechnicalIndicators("BTC"),
      getFearGreedIndex()
    ]);

    const systemMessage = `You are an insightful cryptocurrency market analyst. Follow these guidelines:

1. Focus on explaining WHY the market is moving using available data and news.
2. Be concise and natural in your responses - avoid formulaic structures.
3. Only provide trading suggestions when explicitly asked.
4. Use ONLY the provided real-time data - never invent or assume information.
5. When referencing news or data, always cite the source.
6. If you don't have enough information to explain a market move, say so clearly.

For market analysis:
- Connect price movements to relevant news or sentiment data
- Explain what the Fear & Greed Index means for market psychology
- Note if volume supports or contradicts price moves
- Highlight any divergences or unusual patterns
- Keep responses conversational and varied`;

    const prompt = `Based on this real-time market data:

Market Sentiment:
- Fear & Greed Index: ${fearGreedData.value} (${fearGreedData.classification})
- This indicates ${fearGreedData.classification.toLowerCase()} market sentiment

Price Data (Source: CryptoCompare):
${cryptoData.map(coin => 
  `${coin.symbol}: $${coin.current_price.toLocaleString()}
   ${coin.price_change_percentage_24h >= 0 ? '▲' : '▼'} ${Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
   Vol: $${(coin.total_volume/1e6).toFixed(1)}M`
).join('\n')}

Technical Signals:
${technicalData.rsi ? `- RSI: ${technicalData.rsi}` : ''}
${technicalData.volume_change_24h ? `- 24h Volume Change: ${technicalData.volume_change_24h}%` : ''}
${technicalData.macd ? `- MACD: ${technicalData.macd}` : ''}

Recent News:
${newsData.map((article, i) => `${i + 1}. ${article.title} (${article.source})`).join('\n')}

User Question: ${message}

Remember: Explain WHY things are happening based on this data. If you can't explain something, say so directly.`;

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
      cryptoData: cryptoData.slice(0, 4),
      newsData: newsData.slice(0, 2)
    };
  } catch (error) {
    console.error("Error processing message with OpenAI:", error);
    throw error instanceof Error 
      ? new Error(`Failed to process message: ${error.message}`)
      : new Error("Failed to process message with AI");
  }
}