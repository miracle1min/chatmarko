import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import dotenv from 'dotenv';
import { generateChatCompletion } from './api/mistral';
import { generateImage } from './api/gemini';
import { z } from "zod";
import { insertChatSchema, insertMessageSchema } from "@shared/schema";

dotenv.config();

export async function registerRoutes(app: Express): Promise<Server> {
  // Message API routes
  app.post('/api/chat/message', async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      
      // If it's a user message, save it
      if (validatedData.role === 'user') {
        const message = await storage.createMessage(validatedData);
        
        // For text-based responses, use Mistral
        if (validatedData.responseType === 'text') {
          const response = await generateChatCompletion(validatedData.content);
          
          // Save the assistant's response
          const assistantMessage = await storage.createMessage({
            chatId: validatedData.chatId,
            content: response,
            role: 'assistant',
            model: 'mistral',
            responseType: 'text'
          });
          
          return res.json({ 
            userMessage: message, 
            assistantMessage 
          });
        } 
        // For image generation, use Gemini
        else if (validatedData.responseType === 'image') {
          const imageUrl = await generateImage(validatedData.content);
          
          // Save the assistant's response with the image URL
          const assistantMessage = await storage.createMessage({
            chatId: validatedData.chatId,
            content: imageUrl,
            role: 'assistant',
            model: 'gemini',
            responseType: 'image'
          });
          
          return res.json({ 
            userMessage: message, 
            assistantMessage 
          });
        }
      }
      
      res.status(400).json({ message: 'Invalid request' });
    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).json({ 
        message: 'An error occurred while processing your message',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Chat history API routes
  app.post('/api/chat', async (req, res) => {
    try {
      const validatedData = insertChatSchema.parse(req.body);
      const chat = await storage.createChat(validatedData);
      res.json(chat);
    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({ 
        message: 'Failed to create new chat',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/chat/:id', async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      if (isNaN(chatId)) {
        return res.status(400).json({ message: 'Invalid chat ID' });
      }
      
      const chat = await storage.getChat(chatId);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      
      const messages = await storage.getMessagesByChatId(chatId);
      res.json({ chat, messages });
    } catch (error) {
      console.error('Error fetching chat:', error);
      res.status(500).json({ 
        message: 'Failed to fetch chat',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/chats', async (req, res) => {
    try {
      const chats = await storage.getAllChats();
      res.json(chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ 
        message: 'Failed to fetch chats',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
