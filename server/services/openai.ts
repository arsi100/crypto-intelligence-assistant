import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
export async function analyzeCrypto(prompt: string, context: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a crypto trading expert specializing in technical and fundamental analysis. Use the following indicators for your analysis:
- Moving Averages (MA)
- Relative Strength Index (RSI)
- Moving Average Convergence Divergence (MACD)
- Bollinger Bands
- Volume Analysis
- Support and Resistance Levels
- Market Sentiment

Provide detailed analysis and clear trading recommendations based on these indicators. Include risk assessment and potential entry/exit points. Always include a disclaimer about trading risks.`
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
    throw new Error("Failed to get AI analysis");
  }
}