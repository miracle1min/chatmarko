/**
 * Application Monitoring System
 * 
 * This module provides:
 * - API performance metrics collection
 * - Alert system for errors
 * - Health check endpoints
 */
import { Express, Request, Response, NextFunction } from 'express';
import logger from '../client/src/lib/loggingService';
import os from 'os';

// Track API performance metrics
export interface MetricData {
  totalRequests: number;
  totalErrors: number;
  responseTimeSum: number;
  responseTimeAvg: number;
  endpoints: Record<string, {
    hits: number;
    errors: number;
    responseTimeSum: number;
    responseTimeAvg: number;
    lastResponseTime: number;
  }>;
  statusCodes: Record<number, number>;
}

// Initialize metrics store
const metrics: MetricData = {
  totalRequests: 0,
  totalErrors: 0,
  responseTimeSum: 0,
  responseTimeAvg: 0,
  endpoints: {},
  statusCodes: {}
};

// Configure alert thresholds
export interface AlertThresholds {
  responseTimeThresholdMs: number;
  errorRateThreshold: number; // percentage
  consecutiveErrorsThreshold: number;
}

// Alert configuration
const alertConfig: AlertThresholds = {
  responseTimeThresholdMs: 1000, // 1 second
  errorRateThreshold: 5, // 5%
  consecutiveErrorsThreshold: 3
};

// Track consecutive errors for alert triggering
const consecutiveErrors: Record<string, number> = {};

/**
 * Initialize the application monitoring and registers endpoints
 */
export function setupMonitoring(app: Express): void {
  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Health check endpoint
   *     description: Returns health status of the application and system metrics
   *     tags: [Monitoring]
   *     responses:
   *       200:
   *         description: Health status information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   description: Application status
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                   description: Current server time
   *                 uptime:
   *                   type: number
   *                   description: Server uptime in seconds
   *                 memoryUsage:
   *                   type: object
   *                   properties:
   *                     rss:
   *                       type: number
   *                       description: Resident Set Size memory usage in MB
   *                     heapTotal:
   *                       type: number
   *                       description: Total heap memory in MB
   *                     heapUsed:
   *                       type: number
   *                       description: Used heap memory in MB
   *                     external:
   *                       type: number
   *                       description: External memory in MB
   *                 systemMemory:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: number
   *                       description: Total system memory in MB
   *                     free:
   *                       type: number
   *                       description: Free system memory in MB
   *                     used:
   *                       type: number
   *                       description: Used system memory in MB
   */
  app.get('/api/health', (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const systemMemory = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    };
    
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      memoryUsage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // in MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // in MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // in MB
        external: Math.round(memoryUsage.external / 1024 / 1024) // in MB
      },
      systemMemory: {
        total: Math.round(systemMemory.total / 1024 / 1024), // in MB
        free: Math.round(systemMemory.free / 1024 / 1024), // in MB
        used: Math.round(systemMemory.used / 1024 / 1024) // in MB
      },
      cpu: os.cpus().map(cpu => ({
        model: cpu.model,
        speed: cpu.speed
      }))
    };
    
    res.json(healthData);
  });
  
  /**
   * @swagger
   * /metrics:
   *   get:
   *     summary: API performance metrics
   *     description: Returns detailed performance metrics for all API endpoints
   *     tags: [Monitoring]
   *     responses:
   *       200:
   *         description: Detailed performance metrics
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalRequests:
   *                   type: integer
   *                   description: Total number of API requests
   *                 totalErrors:
   *                   type: integer
   *                   description: Total number of API errors
   *                 responseTimeSum:
   *                   type: number
   *                   description: Sum of all response times in milliseconds
   *                 responseTimeAvg:
   *                   type: number
   *                   description: Average response time in milliseconds
   *                 endpoints:
   *                   type: object
   *                   description: Metrics grouped by endpoint
   *                 statusCodes:
   *                   type: object
   *                   description: Count of HTTP status codes
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                   description: Time when metrics were retrieved
   */
  app.get('/api/metrics', (req, res) => {
    res.json({
      ...metrics,
      timestamp: new Date().toISOString()
    });
  });
  
  /**
   * @swagger
   * /metrics/reset:
   *   post:
   *     summary: Reset performance metrics
   *     description: Resets all collected API performance metrics
   *     tags: [Monitoring]
   *     responses:
   *       200:
   *         description: Metrics successfully reset
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: Confirmation message
   */
  app.post('/api/metrics/reset', (req, res) => {
    // Reset metrics
    Object.keys(metrics.endpoints).forEach(key => {
      delete metrics.endpoints[key];
    });
    Object.keys(metrics.statusCodes).forEach(key => {
      delete metrics.statusCodes[Number(key)];
    });
    
    metrics.totalRequests = 0;
    metrics.totalErrors = 0;
    metrics.responseTimeSum = 0;
    metrics.responseTimeAvg = 0;
    
    res.json({ message: 'Metrics reset successfully' });
  });
  
  // Register middleware to collect metrics on each request
  app.use(performanceMonitoringMiddleware);
}

/**
 * Middleware to monitor API performance
 */
export function performanceMonitoringMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip monitoring for non-API routes and monitoring endpoints themselves
  if (!req.path.startsWith('/api') || 
      req.path === '/api/health' || 
      req.path === '/api/metrics' ||
      req.path === '/api/metrics/reset') {
    return next();
  }
  
  const start = Date.now();
  
  // Store the original end method
  const originalEnd = res.end;
  
  // Override end method to calculate response time and collect metrics
  res.end = function(chunk?: any, encoding?: any, callback?: any): any {
    const responseTime = Date.now() - start;
    
    // Update total metrics
    metrics.totalRequests++;
    metrics.responseTimeSum += responseTime;
    metrics.responseTimeAvg = metrics.responseTimeSum / metrics.totalRequests;
    
    // Update endpoint metrics
    const endpoint = `${req.method} ${req.path}`;
    if (!metrics.endpoints[endpoint]) {
      metrics.endpoints[endpoint] = {
        hits: 0,
        errors: 0,
        responseTimeSum: 0,
        responseTimeAvg: 0,
        lastResponseTime: 0
      };
    }
    
    metrics.endpoints[endpoint].hits++;
    metrics.endpoints[endpoint].responseTimeSum += responseTime;
    metrics.endpoints[endpoint].responseTimeAvg = 
      metrics.endpoints[endpoint].responseTimeSum / metrics.endpoints[endpoint].hits;
    metrics.endpoints[endpoint].lastResponseTime = responseTime;
    
    // Count status codes
    const statusCode = res.statusCode;
    metrics.statusCodes[statusCode] = (metrics.statusCodes[statusCode] || 0) + 1;
    
    // Count errors and trigger alerts
    if (statusCode >= 400) {
      metrics.totalErrors++;
      metrics.endpoints[endpoint].errors++;
      
      // Track consecutive errors for this endpoint
      consecutiveErrors[endpoint] = (consecutiveErrors[endpoint] || 0) + 1;
      
      // Trigger alerts for errors
      checkAlertThresholds(endpoint, statusCode, responseTime);
    } else {
      // Reset consecutive errors on success
      consecutiveErrors[endpoint] = 0;
    }
    
    // Trigger alert for slow responses
    if (responseTime > alertConfig.responseTimeThresholdMs) {
      triggerSlowResponseAlert(endpoint, responseTime);
    }
    
    // Call the original end method
    return originalEnd.apply(res, [chunk, encoding, callback]);
  };
  
  next();
}

/**
 * Check if any alert thresholds are exceeded
 */
function checkAlertThresholds(endpoint: string, statusCode: number, responseTime: number): void {
  // Check consecutive errors threshold
  if (consecutiveErrors[endpoint] >= alertConfig.consecutiveErrorsThreshold) {
    triggerConsecutiveErrorsAlert(endpoint, consecutiveErrors[endpoint]);
  }
  
  // Check error rate threshold
  const totalEndpointRequests = metrics.endpoints[endpoint].hits;
  const endpointErrorRate = (metrics.endpoints[endpoint].errors / totalEndpointRequests) * 100;
  
  if (endpointErrorRate >= alertConfig.errorRateThreshold) {
    triggerErrorRateAlert(endpoint, endpointErrorRate);
  }
}

/**
 * Alert handling functions
 */
function triggerConsecutiveErrorsAlert(endpoint: string, count: number): void {
  logger.error(`ALERT: Endpoint ${endpoint} has ${count} consecutive errors`, {
    alertType: 'consecutive_errors',
    endpoint,
    count,
    timestamp: new Date().toISOString()
  }, ['alert', 'error']);
  
  // Here you could implement additional alert channels:
  // - Send email notifications
  // - Push to Slack/Discord
  // - Trigger a webhook
  // - etc.
}

function triggerErrorRateAlert(endpoint: string, errorRate: number): void {
  logger.error(`ALERT: Endpoint ${endpoint} has high error rate of ${errorRate.toFixed(2)}%`, {
    alertType: 'error_rate',
    endpoint,
    errorRate,
    threshold: alertConfig.errorRateThreshold,
    timestamp: new Date().toISOString()
  }, ['alert', 'error']);
}

function triggerSlowResponseAlert(endpoint: string, responseTime: number): void {
  logger.warn(`ALERT: Endpoint ${endpoint} response time is slow (${responseTime}ms)`, {
    alertType: 'slow_response',
    endpoint,
    responseTime,
    threshold: alertConfig.responseTimeThresholdMs,
    timestamp: new Date().toISOString()
  }, ['alert', 'performance']);
}