/**
 * Validation Middleware
 * 
 * Provides Express middleware functions for request validation and sanitization
 */
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { sanitizeObject } from './inputSanitizer';

/**
 * Middleware factory that creates a validation middleware for a specific schema
 * Also sanitizes the input data before validation
 *
 * @param schema Zod schema to validate against
 * @param source Where to find the data to validate ('body', 'query', 'params')
 * @returns Express middleware function
 */
export function validateRequest(
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // First sanitize the input
      const sanitizedData = sanitizeObject(req[source]);
      
      // Then validate with Zod
      const validatedData = schema.parse(sanitizedData);
      
      // Replace the request data with the sanitized and validated data
      req[source] = validatedData;
      
      next();
    } catch (error) {
      console.error(`Validation error in ${source}:`, error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validasi input gagal',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      
      return res.status(400).json({
        message: 'Invalid request format',
        error: error instanceof Error ? error.message : 'Unknown validation error',
      });
    }
  };
}

/**
 * Rate limiting protection against brute force attacks
 * Reduces the maximum number of attempts allowed from the same IP
 *
 * @param maxAttempts Maximum number of attempts allowed
 * @param windowMs Time window in milliseconds
 * @returns Express middleware function
 */
export function bruteForceProtection(maxAttempts: number = 5, windowMs: number = 60 * 1000) {
  const attempts = new Map<string, { count: number, resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Get or initialize attempts for this IP
    let attempt = attempts.get(ip);
    if (!attempt) {
      attempt = { count: 0, resetTime: now + windowMs };
      attempts.set(ip, attempt);
    }
    
    // Reset if the time window has passed
    if (now > attempt.resetTime) {
      attempt.count = 0;
      attempt.resetTime = now + windowMs;
    }
    
    // Increment attempt count
    attempt.count++;
    
    // Check if max attempts exceeded
    if (attempt.count > maxAttempts) {
      return res.status(429).json({
        message: 'Terlalu banyak permintaan, coba lagi nanti',
        retryAfter: Math.ceil((attempt.resetTime - now) / 1000),
      });
    }
    
    next();
    
    // Cleanup old entries every few minutes
    if (Math.random() < 0.01) { // ~1% chance of running cleanup
      const cleanupTime = now - windowMs;
      attempts.forEach((value, key) => {
        if (value.resetTime < cleanupTime) {
          attempts.delete(key);
        }
      });
    }
  };
}

/**
 * Validates that the content type of the request is as expected
 *
 * @param contentType Expected content type
 * @returns Express middleware function
 */
export function validateContentType(contentType: string = 'application/json') {
  return (req: Request, res: Response, next: NextFunction) => {
    const reqContentType = req.headers['content-type'];
    
    if (!reqContentType || !reqContentType.includes(contentType)) {
      return res.status(415).json({
        message: `Unsupported Media Type. Expected ${contentType}`,
      });
    }
    
    next();
  };
}

/**
 * Enhanced Zod schemas with security-focused refinements
 */

/**
 * Creates a schema for secure text input
 * - Prevents common injection patterns
 * - Limits string length
 * - Validates character set
 */
export function createSecureTextSchema(
  options: {
    minLength?: number,
    maxLength?: number,
    allowHtml?: boolean,
    allowSpecialChars?: boolean
  } = {}
): z.ZodString {
  const {
    minLength = 1,
    maxLength = 1000,
    allowHtml = false, 
    allowSpecialChars = true
  } = options;
  
  // Start with basic string schema
  const schema = z.string()
    .min(minLength, `Teks harus memiliki minimal ${minLength} karakter`)
    .max(maxLength, `Teks tidak boleh lebih dari ${maxLength} karakter`);
  
  // Return appropriate refinements based on options
  if (!allowHtml && !allowSpecialChars) {
    // Most restrictive: no HTML and only basic chars
    return schema.regex(
      /^[a-zA-Z0-9 .,;:!?()_\-+'"\r\n]+$/,
      "Teks hanya boleh mengandung karakter alfanumerik dan tanda baca umum"
    );
  } else if (!allowHtml) {
    // No HTML but special chars allowed
    return schema.regex(
      /^(?!.*<script|javascript:|data:|vbscript:|<iframe|<img|onerror).*$/i,
      "Teks mengandung pola yang berpotensi berbahaya"
    );
  }
  
  // Least restrictive: allow both HTML and special chars
  return schema;
}

/**
 * Creates a schema for secure URL validation
 */
export function createSecureUrlSchema(): z.ZodString {
  return z.string()
    .url("URL tidak valid")
    .regex(
      /^https?:\/\//i,
      "URL harus menggunakan protokol HTTP atau HTTPS"
    );
}

/**
 * Creates a schema for secure email validation
 */
export function createSecureEmailSchema(): z.ZodString {
  return z.string()
    .email("Format email tidak valid")
    .min(5, "Email terlalu pendek")
    .max(254, "Email terlalu panjang");
}

/**
 * Creates a schema for secure ID validation
 * Ensures IDs are positive integers within reasonable range
 */
export function createSecureIdSchema(): z.ZodNumber {
  return z.number()
    .int("ID harus berupa bilangan bulat")
    .positive("ID harus positif")
    .lt(Number.MAX_SAFE_INTEGER, "ID terlalu besar");
}