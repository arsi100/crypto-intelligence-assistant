import OpenAI from "openai";
import type { CryptoPrice, NewsArticle, TradingSignal, DailyAnalysis, AgentTask } from "../../client/src/lib/types";
import { getMarketPrices, getTechnicalIndicators } from "./market";
import { getLatestNews } from "./news";
import { db } from "@db";
import { messages } from "@db/schema";
import { eq } from "drizzle-orm";
import { createAgentTask } from "./agent";

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
   - Only use the provided real-time market data for analysis
   - Consider technical indicators and price movements
   - Look for patterns in trading volume and market cap
   - Base recommendations on actual market conditions

2. Use Chat History:
   - Consider user's previous questions and preferences
   - Maintain context from earlier conversations
   - Adapt responses based on user's knowledge level
   - Keep track of discussed topics and interests

3. When acting as an agent:
   - Identify when tasks like email alerts or notifications are needed
   - Keep track of user preferences and alert thresholds
   - Suggest automated actions when appropriate
   - Be explicit about what automated tasks you can perform

Do not reference external sources like Twitter or forums. Base all analysis solely on the provided market data, technical indicators, and news.

If you identify a need for automation (like price alerts or notifications), format it in your response like this:
---TASK START---
Type: price_alert | email_notification | trading_signal
Parameters: {
  "coin_symbol": "BTC",
  "price_target": 50000,
  "email": "user@example.com",
  "message": "Price target reached"
}
---TASK END---`;

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
    const tasks: AgentTask[] = [];

    // Parse and create agent tasks if present
    if (content.includes('---TASK START---') && content.includes('---TASK END---')) {
      const taskText = content.split('---TASK START---')[1].split('---TASK END---')[0];
      const taskLines = taskText.split('\n').filter(line => line.trim());

      const type = taskLines[0].split(': ')[1].trim() as AgentTask["type"];
      const parametersText = taskLines.slice(1).join('\n');
      const parameters = JSON.parse(parametersText.split('Parameters: ')[1]);

      const task = await createAgentTask(type, parameters, chatId);
      tasks.push(task);
    }

    return {
      message: content,
      cryptoData,
      newsData,
      tasks: tasks.length > 0 ? tasks : undefined
    };
  } catch (error) {
    console.error("Error processing message with OpenAI:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to process message: ${error.message}`);
    }
    throw new Error("Failed to process message with AI");
  }
}