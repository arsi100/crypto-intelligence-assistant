import type { Express } from "express";
import { createServer } from "http";
import { db } from "@db";
import { messages } from "@db/schema";
import { desc, eq } from "drizzle-orm";
import { processMessage } from "./lib/openai";
import { getCryptoPrices } from "./lib/coingecko";
import { getLatestNews } from "./lib/news";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.get("/api/messages", async (_req, res) => {
    try {
      const history = await db.query.messages.findMany({
        orderBy: [desc(messages.timestamp)],
        limit: 50,
      });
      res.json(history.reverse());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      // Store user message
      await db.insert(messages).values({
        content: message,
        isAi: false,
        timestamp: new Date().toISOString(),
      });

      // Get crypto prices and news data
      const [cryptoData, newsData] = await Promise.all([
        getCryptoPrices(),
        getLatestNews(),
      ]);

      // Process with AI
      const aiResponse = await processMessage(message, cryptoData, newsData);

      // Store AI response
      await db.insert(messages).values({
        content: aiResponse.message,
        isAi: true,
        timestamp: new Date().toISOString(),
      });

      res.json(aiResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  return httpServer;
}
