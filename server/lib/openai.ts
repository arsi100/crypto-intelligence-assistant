import OpenAI from "openai";
import type { CryptoPrice, NewsArticle, TradingSignal, DailyAnalysis, AgentTask } from "../../client/src/lib/types";
import { getMarketPrices, getTechnicalIndicators } from "./market";
import { getLatestNews } from "./news";
import { db } from "@db";
import { messages } from "@db/schema";
import { eq } from "drizzle-orm";

export async function processMessage(
  message: string,
  chatId: number
): Promise<{ message: string; cryptoData: CryptoPrice[]; newsData: NewsArticle[]; tasks?: AgentTask[] }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    // Get user's chat history for context
    const chatHistory = await db.query.messages.findMany({
      where: eq(messages.chat_id, chatId),
      orderBy: (messages, { asc }) => [asc(messages.timestamp)],
      limit: 10 // Get last 10 messages for context
    });

    // Fetch real-time market data and news
    const [cryptoData, newsData, technicalData] = await Promise.all([
      getMarketPrices(),
      getLatestNews(),
      getTechnicalIndicators("BTC") // Get BTC indicators as baseline
    ]);

    const systemMessage = `You are an expert cryptocurrency analyst and AI agent. Your role is to:

1. Analyze Market Data:
   - Use the provided real-time market data for analysis
   - Consider technical indicators and price movements
   - Look for patterns in trading volume and market cap
   - Base recommendations on actual market conditions

2. Use Chat History:
   - Consider user's previous questions and preferences
   - Maintain context from earlier conversations
   - Adapt responses based on user's knowledge level
   - Keep track of discussed topics and interests

Important: Do not suggest or mention features like price alerts, email notifications, or automated tasks as these are not yet implemented. Focus only on providing market analysis and insights based on the current data.

Do not reference external sources like Twitter or forums. Base all analysis solely on the provided market data, technical indicators, and news.`;

    const prompt = `Analyze this request using only the following real-time data:

Market Data:
${cryptoData.map(crypto => 
  `${crypto.symbol}:
   - Price: $${crypto.current_price.toLocaleString()}
   - 24h Change: ${crypto.price_change_percentage_24h.toFixed(2)}%
   - Volume: $${crypto.total_volume.toLocaleString()}
   - Market Cap: $${crypto.market_cap.toLocaleString()}`
).join('\n\n')}

Technical Indicators:
${JSON.stringify(technicalData.Data, null, 2)}

Recent News:
${newsData.map(article => `- ${article.title} (${article.source})`).join('\n')}

Chat History:
${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User Request: ${message}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    if (!response.choices[0].message.content) {
      throw new Error("No response content from OpenAI");
    }

    const content = response.choices[0].message.content;

    return {
      message: content,
      cryptoData,
      newsData
    };
  } catch (error) {
    console.error("Error processing message with OpenAI:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to process message: ${error.message}`);
    }
    throw new Error("Failed to process message with AI");
  }
}