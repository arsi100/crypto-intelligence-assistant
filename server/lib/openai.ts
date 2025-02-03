import OpenAI from "openai";
import type { CryptoPrice, NewsArticle } from "../../client/src/lib/types";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI();

export async function processMessage(
  message: string,
  cryptoData: CryptoPrice[],
  newsData: NewsArticle[]
): Promise<{ message: string; cryptoData: CryptoPrice[]; newsData: NewsArticle[] }> {
  try {
    const systemMessage = `You are an expert cryptocurrency analyst with deep knowledge of technical analysis, market psychology, and blockchain technology. Your role is to:

1. Provide detailed market analysis considering:
   - Price movements and technical indicators
   - Market sentiment and news impact
   - Historical patterns and correlations
   - On-chain metrics and network activity

2. When asked about potential price movements:
   - Analyze multiple factors including volatility, trading volume, and market sentiment
   - Consider both technical and fundamental factors
   - Identify specific catalysts that could drive price changes
   - Provide clear reasoning for your predictions
   - Always include risk factors and potential downsides

3. For specific coin analysis:
   - Compare with relevant competitors
   - Evaluate recent developments and partnerships
   - Assess market positioning and unique value propositions

Keep responses comprehensive yet accessible, focusing on actionable insights.
When making predictions, explain your reasoning clearly and include supporting data points.`;

    const prompt = `Analyze this user message and provide insights using the current market data and news:

User message: ${message}

Current crypto prices and 24h changes:
${cryptoData.map(crypto => 
  `${crypto.name} (${crypto.symbol}): $${crypto.current_price} (${crypto.price_change_percentage_24h.toFixed(2)}% 24h)`
).join('\n')}

Market Analysis Context:
- Compare current prices with recent trends
- Look for correlations between different cryptocurrencies
- Consider impact of recent news on price movements

Latest news:
${newsData.map(article => 
  `- ${article.title} (${article.source})`
).join('\n')}

Provide a detailed analysis that:
1. Directly answers the user's query
2. Includes relevant market data and news impact
3. Identifies potential opportunities or risks
4. Explains the reasoning behind any predictions`;

    console.log("Sending request to OpenAI...");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // Changed to a stable model
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

    console.log("Received response from OpenAI");
    return {
      message: response.choices[0].message.content,
      cryptoData,
      newsData,
    };
  } catch (error) {
    console.error("Error processing message with OpenAI:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to process message: ${error.message}`);
    }
    throw new Error("Failed to process message with AI");
  }
}