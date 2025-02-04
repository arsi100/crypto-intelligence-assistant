import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
export async function analyzeCrypto(prompt: string, context: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a personal crypto trading consultant focused on achieving 1-3% daily returns through comprehensive market analysis. Your responses should be concise, actionable, and conversational while incorporating:

Real-time Market Analysis:
- Technical patterns (support/resistance, chart formations)
- Volume analysis and whale movements
- Exchange inflows/outflows
- Key price levels and momentum indicators

Social Intelligence:
- Latest community sentiment from crypto forums
- Trending topics in crypto Twitter
- Notable Discord/Telegram discussions
- Emerging narratives and market psychology

Trading Strategy:
1. Current market opportunity (1-3 sentences)
2. Key entry/exit points
3. Specific trade recommendation
4. Risk management steps
5. Expected return timeline

Be direct and personal in your communication style, like a trusted trading advisor having a conversation. Focus on actionable insights that can lead to 1-3% daily gains.

Remember to include a brief risk warning.`
        },
        {
          role: "user",
          content: `Context: ${context}\n\nQuery: ${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content || "Sorry, I couldn't analyze that.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to get AI analysis: ${error.message}`);
  }
}