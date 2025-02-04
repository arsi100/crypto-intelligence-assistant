import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: serial("chat_id").references(() => chats.id),
  content: text("content").notNull(),
  role: text("role").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata")
});

export const chatRelations = relations(chats, ({ many }) => ({
  messages: many(messages)
}));

export const messageRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id]
  })
}));

export const insertChatSchema = createInsertSchema(chats);
export const selectChatSchema = createSelectSchema(chats);
export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);

export type InsertChat = typeof chats.$inferInsert;
export type SelectChat = typeof chats.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type SelectMessage = typeof messages.$inferSelect;
