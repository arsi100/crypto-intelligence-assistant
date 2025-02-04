import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

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
  type: text("type").notNull(), // 'price_alert' | 'email_notification' | 'trading_signal'
  parameters: jsonb("parameters").notNull(),
  status: text("status").notNull(), // 'pending' | 'active' | 'completed' | 'failed'
  created_at: timestamp("created_at").defaultNow().notNull(),
  completed_at: timestamp("completed_at"),
  chat_id: serial("chat_id").references(() => chats.id),
});

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

export const insertChatSchema = createInsertSchema(chats);
export const selectChatSchema = createSelectSchema(chats);
export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);
export const insertAgentTaskSchema = createInsertSchema(agentTasks);
export const selectAgentTaskSchema = createSelectSchema(agentTasks);

export type InsertChat = typeof chats.$inferInsert;
export type SelectChat = typeof chats.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type SelectMessage = typeof messages.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;
export type SelectAgentTask = typeof agentTasks.$inferSelect;