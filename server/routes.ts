import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { messages, chats, agentTasks } from "@db/schema";
import { processMessage } from "./lib/openai";
import { startAgentTaskProcessor } from "./lib/agent";
import { getMarketPrices } from "./lib/market";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Start the agent task processor
  startAgentTaskProcessor();

  // Health check endpoint for Render
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "healthy" });
  });

  // Get top cryptocurrencies market data
  app.get("/api/market/top", async (_req, res) => {
    try {
      const marketData = await getMarketPrices();
      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  // Create a new chat session
  app.post("/api/chat", async (req, res) => {
    try {
      const userMessage = req.body.content;

      // Create a new chat if needed
      let chatId = req.body.chatId;
      if (!chatId) {
        const [newChat] = await db.insert(chats).values({}).returning();
        chatId = newChat.id;
      }

      // Store user message
      await db.insert(messages).values({
        chat_id: chatId,
        content: userMessage,
        role: "user"
      });

      // Get AI response with chat history context and potential agent tasks
      const { message: response, cryptoData, newsData, tasks } = await processMessage(userMessage, chatId);

      // Store AI response
      await db.insert(messages).values({
        chat_id: chatId,
        content: response,
        role: "assistant",
        metadata: { cryptoData, newsData }
      });

      res.json({ response, chatId, cryptoData, newsData, tasks });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Get chat history
  app.get("/api/chat/history", async (req, res) => {
    try {
      const allMessages = await db.query.messages.findMany({
        orderBy: (messages, { asc }) => [asc(messages.timestamp)]
      });
      res.json(allMessages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Get agent tasks for a chat
  app.get("/api/chat/:chatId/tasks", async (req, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const tasks = await db.query.agentTasks.findMany({
        where: eq(agentTasks.chat_id, chatId),
        orderBy: (agentTasks, { desc }) => [desc(agentTasks.created_at)]
      });
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}