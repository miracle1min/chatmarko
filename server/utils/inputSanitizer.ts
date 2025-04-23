/**
 * Input Sanitization Utility
 * 
 * Provides functions to sanitize and secure user input
 * to protect against common security threats like XSS, SQL Injection, etc.
 */

/**
 * Sanitizes text input by removing potentially harmful characters and scripts
 * 
 * @param input The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  // Convert to string if not already
  const text = String(input);
  
  return text
    // Replace HTML special chars with their encoded versions
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Remove potential script tags (even encoded ones)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove potential inline event handlers
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/on\w+=\w+/g, '');
}

/**
 * Sanitizes a URL to prevent potentially harmful links
 * 
 * @param url The URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsedUrl = new URL(url);
    // Only allow certain protocols
    if (['http:', 'https:'].includes(parsedUrl.protocol)) {
      return parsedUrl.toString();
    }
    return '';
  } catch {
    // If URL is invalid, return empty string
    return '';
  }
}

/**
 * Sanitizes an integer to ensure it's a valid number
 * 
 * @param value Value to sanitize
 * @param defaultValue Default value if invalid
 * @returns Sanitized integer
 */
export function sanitizeInteger(value: any, defaultValue: number = 0): number {
  if (value === undefined || value === null) return defaultValue;
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultValue;
  
  return parsed;
}

/**
 * Sanitizes a float to ensure it's a valid number
 * 
 * @param value Value to sanitize
 * @param defaultValue Default value if invalid
 * @returns Sanitized float
 */
export function sanitizeFloat(value: any, defaultValue: number = 0): number {
  if (value === undefined || value === null) return defaultValue;
  
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return defaultValue;
  
  return parsed;
}

/**
 * Sanitizes boolean values
 * 
 * @param value Value to convert to boolean
 * @param defaultValue Default value if the input cannot be clearly determined
 * @returns Sanitized boolean
 */
export function sanitizeBoolean(value: any, defaultValue: boolean = false): boolean {
  if (value === undefined || value === null) return defaultValue;
  
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowercased = value.toLowerCase();
    if (['true', 'yes', 'y', '1', 'on'].includes(lowercased)) return true;
    if (['false', 'no', 'n', '0', 'off'].includes(lowercased)) return false;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  
  return defaultValue;
}

/**
 * Sanitizes an object by applying sanitization to all string properties
 * 
 * @param obj Object to sanitize
 * @returns New object with sanitized string values
 */
export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== 'object') return {};
  
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : 
        typeof item === 'object' ? sanitizeObject(item) : item
      );
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Sanitizes an email address to ensure it follows basic email format
 * 
 * @param email Email to sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return '';
  
  return email.trim().toLowerCase();
}

/**
 * Sanitizes SQL-like input to prevent SQL injection
 * 
 * @param input String to sanitize
 * @returns Sanitized string safe for SQL contexts
 */
export function sanitizeSqlInput(input: string): string {
  if (!input) return '';
  
  return String(input)
    .replace(/'/g, "''")        // Escape single quotes
    .replace(/\\/g, '\\\\')     // Escape backslashes
    .replace(/\0/g, '\\0')      // Escape null bytes
    .replace(/\n/g, '\\n')      // Escape newlines
    .replace(/\r/g, '\\r')      // Escape carriage returns
    .replace(/\x1a/g, '\\Z');   // Escape SUB character
}