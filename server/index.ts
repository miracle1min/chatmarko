import express, { type Request, Response, NextFunction } from 'express';
import { registerRoutes } from './routes';
import { setupVite, serveStatic, log } from './vite';
import path from 'path';
import logger from '../client/src/lib/loggingService';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { setupMonitoring } from './monitoring';

const app = express();

// Aktivasi trust proxy untuk express-rate-limit yang bekerja dengan benar di lingkungan Replit
app.set('trust proxy', 1);

// Use Helmet for secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for development
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://mistral-api-endpoint.com", "https://gemini-api-endpoint.com"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false, // For development
  crossOriginResourcePolicy: { policy: "cross-origin" } // For development
}));

// Rate limiting middleware
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Terlalu banyak request chat, coba lagi dalam beberapa menit',
  standardHeaders: true,
  legacyHeaders: false,
});

const imageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Batas generasi gambar tercapai, coba lagi dalam 1 jam',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/chat', chatLimiter);
app.use('/api/image', imageLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the public directory
app.use(express.static(path.join(process.cwd(), 'public')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…';
      }

      log(logLine);

      // Log API request to our logging service
      logger.info(`API Request: ${req.method} ${path}`, {
        statusCode: res.statusCode,
        duration,
        method: req.method,
        path: path,
        timestamp: new Date().toISOString()
      });
    }
  });

  next();
});

(async () => {
  // Set up monitoring system
  setupMonitoring(app);

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log errors to our logging service
    logger.error('Server Error', {
      error: {
        status,
        message,
        stack: err.stack,
      },
      timestamp: new Date().toISOString()
    });

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || process.env.VERCEL_URL ? 80 : 5000;
  server.listen(
    {
      port,
      host: '0.0.0.0',
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);

      // Log server startup
      logger.info(`Server started on port ${port}`, {
        environment: app.get('env'),
        timestamp: new Date().toISOString()
      });
    }
  );
})();