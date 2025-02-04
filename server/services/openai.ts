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
          content: "You are a cryptocurrency market analyst. Provide insightful analysis based on market data and trends. Be concise but thorough."
        },
        {
          role: "user",
          content: `Context: ${context}\n\nQuery: ${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content || "Sorry, I couldn't analyze that.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to get AI analysis");
  }
}
