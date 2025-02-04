import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { messages, chats } from "@db/schema";
import { analyzeCrypto } from "./services/openai";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
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
        chatId,
        content: userMessage,
        role: "user"
      });

      // Get AI response
      const response = await analyzeCrypto(userMessage, "");

      // Store AI response
      await db.insert(messages).values({
        chatId,
        content: response,
        role: "assistant"
      });

      res.json({ response, chatId });
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

  const httpServer = createServer(app);
  return httpServer;
}