import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { messages, chats, agentTasks, reddit_posts, market_history, technical_indicators } from "@db/schema";
import { processMessage } from "./lib/openai";
import { startAgentTaskProcessor } from "./lib/agent";
import { eq, desc, and, gte } from "drizzle-orm";
import { getRedditPosts, updateRedditSentiments } from "./lib/news";

export function registerRoutes(app: Express): Server {
  // Start the agent task processor
  startAgentTaskProcessor();

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

  // Get Reddit posts
  app.get("/api/reddit/posts", async (req, res) => {
    try {
      const posts = await db.query.reddit_posts.findMany({
        orderBy: (posts, { desc }) => [desc(posts.created_at)],
        limit: 10
      });
      res.json(posts);
    } catch (error) {
      console.error("Error fetching Reddit posts:", error);
      res.status(500).json({ error: "Failed to fetch Reddit posts" });
    }
  });

  // Get market history for a symbol
  app.get("/api/market/history/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { days = "7" } = req.query;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days as string));

      const history = await db.query.market_history.findMany({
        where: and(
          eq(market_history.symbol, symbol.toUpperCase()),
          gte(market_history.timestamp, startDate)
        ),
        orderBy: (history, { asc }) => [asc(history.timestamp)]
      });
      
      res.json(history);
    } catch (error) {
      console.error("Error fetching market history:", error);
      res.status(500).json({ error: "Failed to fetch market history" });
    }
  });

  // Get technical indicators for a symbol
  app.get("/api/market/indicators/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      
      const indicators = await db.query.technical_indicators.findMany({
        where: eq(technical_indicators.symbol, symbol.toUpperCase()),
        orderBy: (indicators, { desc }) => [desc(indicators.timestamp)],
        limit: 1
      });
      
      res.json(indicators);
    } catch (error) {
      console.error("Error fetching technical indicators:", error);
      res.status(500).json({ error: "Failed to fetch technical indicators" });
    }
  });

  // Manually trigger Reddit posts update
  app.post("/api/reddit/update", async (req, res) => {
    try {
      await getRedditPosts();
      await updateRedditSentiments();
      res.json({ message: "Reddit posts updated successfully" });
    } catch (error) {
      console.error("Error updating Reddit posts:", error);
      res.status(500).json({ error: "Failed to update Reddit posts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}