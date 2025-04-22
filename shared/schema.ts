import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  model: text("model").notNull(), // 'mistral' or 'gemini'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  responseType: text("response_type").default("text"), // 'text' or 'image'
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatSchema = createInsertSchema(chats).pick({
  title: true,
  userId: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  chatId: true,
  content: true,
  role: true,
  model: true,
  responseType: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Additional custom types for the application
export type ChatMessage = {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  model: 'mistral' | 'gemini';
  createdAt: Date;
  responseType: 'text' | 'image';
};

export type ChatHistory = {
  id: number;
  title: string;
  createdAt: Date;
};
