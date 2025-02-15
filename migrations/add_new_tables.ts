import { pgTable, text, serial, timestamp, jsonb, integer, numeric } from "drizzle-orm/pg-core";

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

// New tables SQL will go here 