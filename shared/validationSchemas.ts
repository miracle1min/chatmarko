/**
 * Enhanced Validation Schemas
 * 
 * Provides more robust validation schemas for the application
 * with stronger security and input validation rules
 */
import { z } from 'zod';
import { insertChatSchema, insertMessageSchema } from './schema';

/**
 * Regular expressions for security validation
 */
// For detecting potential XSS patterns
const XSS_PATTERN = /<script|javascript:|data:|vbscript:|<iframe|<img|onerror|onload|onclick|onmouseover|onfocus|onblur|onkeypress|onsubmit|document\.|window\.|eval\(|setTimeout\(|setInterval\(|Function\(|fetch\(|XMLHttpRequest|ActiveXObject/i;

// For detecting SQL injection patterns
const SQL_INJECTION_PATTERN = /(\b(select|insert|update|delete|drop|alter|create|union|into|load_file|outfile|from|where|database|table)\b.*(\b(from|into)\b|\*|--|;))/i;

// Safer patterns for specific inputs
const SAFE_USERNAME_PATTERN = /^[a-zA-Z0-9_\-.]{3,32}$/;
const SAFE_TITLE_PATTERN = /^[a-zA-Z0-9\s_\-.,!?&()[\]:;'"+]{1,100}$/;

/**
 * Enhanced Chat Schema
 * Adds additional validation and protection for chat data
 */
export const enhancedChatSchema = insertChatSchema.extend({
  title: z.string()
    .min(1, "Judul chat tidak boleh kosong")
    .max(100, "Judul chat tidak boleh lebih dari 100 karakter")
    .refine(
      (title) => !XSS_PATTERN.test(title),
      {
        message: "Judul mengandung pola yang tidak diizinkan"
      }
    )
    .refine(
      (title) => !SQL_INJECTION_PATTERN.test(title),
      {
        message: "Judul mengandung pola SQL yang tidak diizinkan"
      }
    )
    .refine(
      (title) => SAFE_TITLE_PATTERN.test(title),
      {
        message: "Judul hanya boleh mengandung alfanumerik dan tanda baca umum"
      }
    ),
  userId: insertChatSchema.shape.userId
});

/**
 * Chat ID Parameter Schema
 * For validating chat ID in URL parameters
 */
export const chatIdParamSchema = z.object({
  id: z.string()
    .refine(
      (val) => {
        const parsed = parseInt(val);
        return !isNaN(parsed) && parsed > 0 && parsed < Number.MAX_SAFE_INTEGER;
      },
      {
        message: "ID chat harus berupa angka positif yang valid"
      }
    )
});

/**
 * Enhanced Message Schema
 * Adds additional validation and protection for message data
 */
export const enhancedMessageSchema = insertMessageSchema.extend({
  content: z.string()
    .min(1, "Pesan tidak boleh kosong")
    .max(1000, "Pesan tidak boleh lebih dari 1000 karakter")
    .refine(
      (content) => !XSS_PATTERN.test(content),
      {
        message: "Pesan mengandung pola yang tidak diizinkan"
      }
    ),
  chatId: z.number()
    .int("Chat ID harus berupa bilangan bulat")
    .positive("Chat ID harus positif")
    .refine(
      value => value < Number.MAX_SAFE_INTEGER,
      {
        message: "Chat ID terlalu besar"
      }
    ),
  role: z.enum(["user", "assistant"], {
    errorMap: () => ({ message: "Role harus 'user' atau 'assistant'" })
  }),
  model: z.enum(["mistral", "gemini"], {
    errorMap: () => ({ message: "Model harus 'mistral' atau 'gemini'" })
  }),
  responseType: z.enum(["text", "image"], {
    errorMap: () => ({ message: "Tipe respons harus 'text' atau 'image'" })
  })
});

/**
 * Schema for user message validation
 * Specific for messages sent by users to generate AI responses
 */
export const userMessageSchema = enhancedMessageSchema.refine(
  (data) => data.role === 'user',
  {
    message: "Pesan harus dari pengguna",
    path: ["role"]
  }
);

/**
 * Schema for text prompts validation
 * More strict validation for text-based inputs
 */
export const textPromptSchema = userMessageSchema.refine(
  (data) => data.responseType === 'text',
  {
    message: "Tipe respons harus 'text'",
    path: ["responseType"] 
  }
);

/**
 * Schema for image generation prompts
 * Additional validation specific to image generation requests
 */
export const imagePromptSchema = userMessageSchema
  .refine(
    (data) => data.responseType === 'image',
    {
      message: "Tipe respons harus 'image'",
      path: ["responseType"]
    }
  )
  .refine(
    (data) => {
      // Doesn't contain specific forbidden content for image generation
      const forbiddenTerms = /\b(porn|nsfw|nude|deepfake|hentai|explicit)\b/i;
      return !forbiddenTerms.test(data.content);
    },
    {
      message: "Prompt berisi konten yang tidak diperbolehkan untuk generasi gambar",
      path: ["content"]
    }
  );