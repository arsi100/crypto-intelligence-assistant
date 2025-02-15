import { pgTable, text, serial, timestamp, jsonb, integer, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Existing tables
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chat_id: serial("chat_id").references(() => chats.id),
  content: text("content").notNull(),
  role: text("role").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata")
});

export const agentTasks = pgTable("agent_tasks", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  parameters: jsonb("parameters").notNull(),
  status: text("status").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  completed_at: timestamp("completed_at"),
  chat_id: serial("chat_id").references(() => chats.id),
});

// New tables for social and market data
export const reddit_posts = pgTable("reddit_posts", {
  id: serial("id").primaryKey(),
  post_id: text("post_id").notNull().unique(),
  title: text("title").notNull(),
  content: text("content"),
  url: text("url").notNull(),
  score: integer("score").notNull(),
  num_comments: integer("num_comments").notNull(),
  sentiment_score: numeric("sentiment_score").notNull(),
  created_at: timestamp("created_at").notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const market_history = pgTable("market_history", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  price: numeric("price").notNull(),
  volume: numeric("volume").notNull(),
  market_cap: numeric("market_cap"),
  timestamp: timestamp("timestamp").notNull(),
});

export const technical_indicators = pgTable("technical_indicators", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  indicator_type: text("indicator_type").notNull(), 
  value: numeric("value").notNull(),
  parameters: jsonb("parameters"), 
  timestamp: timestamp("timestamp").notNull(),
});

// Relations
export const chatRelations = relations(chats, ({ many }) => ({
  messages: many(messages),
  tasks: many(agentTasks)
}));

export const messageRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chat_id],
    references: [chats.id]
  })
}));

export const agentTaskRelations = relations(agentTasks, ({ one }) => ({
  chat: one(chats, {
    fields: [agentTasks.chat_id],
    references: [chats.id]
  })
}));

// Schemas
export const insertChatSchema = createInsertSchema(chats);
export const selectChatSchema = createSelectSchema(chats);
export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);
export const insertAgentTaskSchema = createInsertSchema(agentTasks);
export const selectAgentTaskSchema = createSelectSchema(agentTasks);

// Types
export type InsertChat = typeof chats.$inferInsert;
export type SelectChat = typeof chats.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type SelectMessage = typeof messages.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;
export type SelectAgentTask = typeof agentTasks.$inferSelect;