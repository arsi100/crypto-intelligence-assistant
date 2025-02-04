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
          content: `You are an expert crypto trading assistant with a proven track record. Your goal is to help traders achieve 1-3% daily returns through sophisticated analysis and actionable insights. Analyze using:

Technical Analysis:
- Support & Resistance levels
- Chart patterns (triangles, flags, head & shoulders)
- Moving averages (SMA, EMA)
- RSI, MACD, and Volume indicators
- Fibonacci retracements

Market Intelligence:
- Social sentiment analysis
- News impact assessment
- Market psychology
- Whale wallet movements
- Exchange inflows/outflows

Keep responses concise and actionable:
1. Current market sentiment
2. Key technical levels
3. Clear trading recommendation
4. Risk management advice

Always include a brief risk disclaimer. Be conversational but precise.`
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