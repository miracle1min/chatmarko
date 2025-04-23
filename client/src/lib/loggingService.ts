/**
 * Logging Service - Provides centralized error logging functionality
 * 
 * This service can be connected to external error tracking systems like Sentry, LogRocket, etc.
 */

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// Log entry interface
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  tags?: string[];
}

class LoggingService {
  private isInitialized = false;
  private logs: LogEntry[] = [];
  private MAX_LOGS = 1000; // Limit the number of logs stored in memory
  private endpoint?: string; // Remote logging endpoint

  constructor() {
    // Initialize logging service
    this.initialize();
  }

  /**
   * Initialize the logging service
   */
  initialize(endpoint?: string): void {
    if (this.isInitialized) return;

    this.endpoint = endpoint;
    
    // Add global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError);
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
      
      // Expose method for ErrorBoundary
      window.logErrorToService = (error: Error, errorInfo: any) => {
        this.error('React Error Boundary caught an error', {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          componentStack: errorInfo?.componentStack,
        });
      };
    }

    this.isInitialized = true;
    this.info('Logging service initialized');
  }

  /**
   * Clean up event listeners on service destruction
   */
  cleanup(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleGlobalError);
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  /**
   * Handle global error events
   */
  private handleGlobalError = (event: ErrorEvent): void => {
    this.error('Uncaught error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });
  };

  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const reason = event.reason;
    
    this.error('Unhandled Promise rejection', {
      reason: reason instanceof Error ? {
        name: reason.name,
        message: reason.message,
        stack: reason.stack,
      } : reason,
    });
  };

  /**
   * Create and store a log entry
   */
  private createLog(level: LogLevel, message: string, context?: Record<string, any>, tags?: string[]): LogEntry {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      tags,
    };

    // Add to in-memory logs
    this.logs.unshift(logEntry);
    
    // Trim logs if they exceed max count
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // Send to console
    this.logToConsole(logEntry);

    // Send to remote endpoint if configured
    if (this.endpoint) {
      this.sendToRemoteEndpoint(logEntry);
    }

    return logEntry;
  }

  /**
   * Log to browser console
   */
  private logToConsole(logEntry: LogEntry): void {
    const { level, message, context } = logEntry;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`[DEBUG] ${message}`, context);
        break;
      case LogLevel.INFO:
        console.info(`[INFO] ${message}`, context);
        break;
      case LogLevel.WARN:
        console.warn(`[WARN] ${message}`, context);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(`[${level.toUpperCase()}] ${message}`, context);
        break;
    }
  }

  /**
   * Send log to remote endpoint
   */
  private sendToRemoteEndpoint(logEntry: LogEntry): void {
    if (!this.endpoint) return;

    // In a real implementation, we would send this to a logging service
    // This is just a placeholder to show how it would work
    try {
      fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
        // Use 'keepalive' to ensure logs are sent even when the page is unloading
        keepalive: true,
      }).catch(error => {
        console.error('Failed to send log to remote endpoint', error);
      });
    } catch (error) {
      console.error('Error sending log to remote endpoint', error);
    }
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>, tags?: string[]): LogEntry {
    return this.createLog(LogLevel.DEBUG, message, context, tags);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>, tags?: string[]): LogEntry {
    return this.createLog(LogLevel.INFO, message, context, tags);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>, tags?: string[]): LogEntry {
    return this.createLog(LogLevel.WARN, message, context, tags);
  }

  /**
   * Log error message
   */
  error(message: string, context?: Record<string, any>, tags?: string[]): LogEntry {
    return this.createLog(LogLevel.ERROR, message, context, tags);
  }

  /**
   * Log fatal error message
   */
  fatal(message: string, context?: Record<string, any>, tags?: string[]): LogEntry {
    return this.createLog(LogLevel.FATAL, message, context, tags);
  }
}

// Create a singleton instance
export const logger = new LoggingService();

// Export default instance
export default logger;