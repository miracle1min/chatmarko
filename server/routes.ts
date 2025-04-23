import type { Express, Request, Response, NextFunction } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import dotenv from 'dotenv';
import { generateChatCompletion } from './api/mistral';
import { generateImage } from './api/gemini';
import { z } from 'zod';
import { insertChatSchema, insertMessageSchema } from '@shared/schema';
import { 
  enhancedChatSchema, 
  enhancedMessageSchema, 
  chatIdParamSchema,
  textPromptSchema,
  imagePromptSchema
} from '@shared/validationSchemas';
import { 
  validateRequest, 
  bruteForceProtection, 
  validateContentType 
} from './utils/validationMiddleware';
import { sanitizeObject, sanitizeText } from './utils/inputSanitizer';
import { setupSwagger } from './swagger';

dotenv.config();

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up Swagger documentation
  setupSwagger(app);

  /**
   * @swagger
   * /chat/message:
   *   post:
   *     summary: Send a message and get AI response
   *     description: Send a user message and get a response from either Mistral (text) or Gemini (image) AI models
   *     tags: [Messages]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/NewMessageRequest'
   *     responses:
   *       200:
   *         description: User message and AI response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MessageResponse'
   *       400:
   *         description: Invalid request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       429:
   *         description: Rate limit exceeded
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post(
    '/api/chat/message',
    validateContentType('application/json'),
    // Rate limit protection for message endpoint
    bruteForceProtection(50, 60 * 1000), // 50 requests per minute
    // Validate and sanitize the input body
    validateRequest(enhancedMessageSchema),
    async (req, res) => {
      try {
        const validatedData = req.body;

        // If it's a user message, save it
        if (validatedData.role === 'user') {
          // Sanitize the message content
          const sanitizedContent = sanitizeText(validatedData.content);
          
          // Create message with sanitized content
          const message = await storage.createMessage({
            ...validatedData,
            content: sanitizedContent
          });

          // For text-based responses, use Mistral
          if (validatedData.responseType === 'text') {
            const response = await generateChatCompletion(sanitizedContent);

            // Save the assistant's response
            const assistantMessage = await storage.createMessage({
              chatId: validatedData.chatId,
              content: response,
              role: 'assistant',
              model: 'mistral',
              responseType: 'text',
            });

            return res.json({
              userMessage: message,
              assistantMessage,
            });
          }
          // For image generation, use Gemini
          else if (validatedData.responseType === 'image') {
            const imageUrl = await generateImage(sanitizedContent);

            // Save the assistant's response with the image URL
            const assistantMessage = await storage.createMessage({
              chatId: validatedData.chatId,
              content: imageUrl,
              role: 'assistant',
              model: 'gemini',
              responseType: 'image',
            });

            return res.json({
              userMessage: message,
              assistantMessage,
            });
          }
        }

        res.status(400).json({ message: 'Invalid request: only user messages are allowed' });
      } catch (error) {
        console.error('Error processing message:', error);
        
        if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
          return res.status(400).json({
            message: 'Validasi input gagal',
            errors: (error as any).errors,
          });
        }
        
        res.status(500).json({
          message: 'An error occurred while processing your message',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * @swagger
   * /chat:
   *   post:
   *     summary: Create a new chat
   *     description: Create a new chat with the given title
   *     tags: [Chats]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/NewChatRequest'
   *     responses:
   *       200:
   *         description: Created chat
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Chat'
   *       400:
   *         description: Invalid request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       429:
   *         description: Rate limit exceeded
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post(
    '/api/chat',
    validateContentType('application/json'),
    // Add rate limiting to prevent abuse
    bruteForceProtection(20, 60 * 1000), // 20 requests per minute
    // Validate and sanitize the input body
    validateRequest(enhancedChatSchema),
    async (req, res) => {
      try {
        const validatedData = req.body;
        
        // Additional sanitization of chat title
        const sanitizedTitle = sanitizeText(validatedData.title);
        
        // Create chat with sanitized title
        const chat = await storage.createChat({
          ...validatedData,
          title: sanitizedTitle
        });
        
        res.json(chat);
      } catch (error) {
        console.error('Error creating chat:', error);
        
        if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
          return res.status(400).json({
            message: 'Validasi input gagal',
            errors: (error as any).errors,
          });
        }
        
        res.status(500).json({
          message: 'Failed to create new chat',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * @swagger
   * /chat/{id}:
   *   get:
   *     summary: Get a specific chat with messages
   *     description: Retrieve a chat by ID with all its messages
   *     tags: [Chats]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Chat ID
   *     responses:
   *       200:
   *         description: Chat with messages
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ChatWithMessages'
   *       400:
   *         description: Invalid chat ID
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Chat not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       429:
   *         description: Rate limit exceeded
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get(
    '/api/chat/:id',
    // Rate limiting to prevent enumeration attacks
    bruteForceProtection(30, 60 * 1000), // 30 requests per minute
    // Validate and sanitize the ID parameter
    validateRequest(chatIdParamSchema, 'params'),
    async (req, res) => {
      try {
        // Parse and sanitize the ID
        const chatId = parseInt(req.params.id, 10);
        
        // Validate that it's a positive integer
        if (chatId <= 0 || chatId >= Number.MAX_SAFE_INTEGER) {
          return res.status(400).json({ 
            message: 'Invalid chat ID', 
            error: 'ID chat harus berupa angka positif yang valid'
          });
        }

        const chat = await storage.getChat(chatId);
        if (!chat) {
          return res.status(404).json({ message: 'Chat not found' });
        }

        const messages = await storage.getMessagesByChatId(chatId);
        
        // Sanitize all messages content for additional security
        const sanitizedMessages = messages.map(message => ({
          ...message,
          // Only sanitize text content, not image URLs
          content: message.responseType === 'text' ? sanitizeText(message.content) : message.content
        }));
        
        res.json({ 
          chat: {
            ...chat,
            title: sanitizeText(chat.title)
          }, 
          messages: sanitizedMessages 
        });
      } catch (error) {
        console.error('Error fetching chat:', error);
        res.status(500).json({
          message: 'Failed to fetch chat',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * @swagger
   * /chats:
   *   get:
   *     summary: Get all chats
   *     description: Retrieve a list of all chats
   *     tags: [Chats]
   *     responses:
   *       200:
   *         description: List of chats
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Chat'
   *       429:
   *         description: Rate limit exceeded
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get(
    '/api/chats',
    // Add light rate limiting to prevent abuse
    bruteForceProtection(100, 60 * 1000), // 100 requests per minute
    async (req, res) => {
      try {
        const chats = await storage.getAllChats();
        
        // Sanitize chat titles for additional security
        const sanitizedChats = chats.map(chat => ({
          ...chat,
          title: sanitizeText(chat.title)
        }));
        
        res.json(sanitizedChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({
          message: 'Failed to fetch chats',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  /**
   * @swagger
   * /chat/{id}:
   *   delete:
   *     summary: Delete a chat
   *     description: Delete a chat and all its messages
   *     tags: [Chats]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Chat ID
   *     responses:
   *       200:
   *         description: Chat successfully deleted
   *       400:
   *         description: Invalid chat ID
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Chat not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       429:
   *         description: Rate limit exceeded
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.delete(
    '/api/chat/:id',
    // Add stronger rate limiting for destructive operations
    bruteForceProtection(10, 60 * 1000), // 10 delete requests per minute
    // Validate and sanitize params
    validateRequest(chatIdParamSchema, 'params'),
    async (req, res) => {
      try {
        // Sanitize the input
        const chatId = parseInt(req.params.id, 10);
        
        // Validate the chat ID
        if (isNaN(chatId) || chatId <= 0 || chatId >= Number.MAX_SAFE_INTEGER) {
          return res.status(400).json({ 
            message: 'Invalid chat ID', 
            error: 'ID chat harus berupa angka positif yang valid'
          });
        }
        
        // Check if chat exists
        const chat = await storage.getChat(chatId);
        if (!chat) {
          return res.status(404).json({ message: 'Chat not found' });
        }
        
        // Delete chat and its messages
        const success = await storage.deleteChat(chatId);
        
        if (success) {
          res.status(200).json({ message: 'Chat successfully deleted' });
        } else {
          res.status(500).json({ message: 'Failed to delete chat' });
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({
          message: 'Failed to delete chat',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  const httpServer = createServer(app);

  return httpServer;
}
