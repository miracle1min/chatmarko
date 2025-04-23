import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Chat Application API',
      version: '1.0.0',
      description: 'API documentation for the AI Chat Application',
      contact: {
        name: 'Support',
        email: 'support@aichat.app',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            displayName: {
              type: 'string',
              description: 'Display name',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date',
            },
          },
        },
        Chat: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Chat ID',
            },
            title: {
              type: 'string',
              description: 'Chat title',
            },
            userId: {
              type: 'integer',
              description: 'User ID that owns this chat',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date',
            },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Message ID',
            },
            chatId: {
              type: 'integer',
              description: 'Chat ID this message belongs to',
            },
            content: {
              type: 'string',
              description: 'Message content',
            },
            role: {
              type: 'string',
              enum: ['user', 'assistant'],
              description: 'Role of the message sender',
            },
            model: {
              type: 'string',
              enum: ['mistral', 'gemini'],
              description: 'AI model used for this message',
            },
            responseType: {
              type: 'string',
              enum: ['text', 'image'],
              description: 'Type of response (text or image)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date',
            },
          },
        },
        NewChatRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              description: 'Chat title',
            },
            userId: {
              type: 'integer',
              description: 'User ID (optional)',
            },
          },
        },
        NewMessageRequest: {
          type: 'object',
          required: ['chatId', 'content', 'role', 'model', 'responseType'],
          properties: {
            chatId: {
              type: 'integer',
              description: 'Chat ID this message belongs to',
            },
            content: {
              type: 'string',
              description: 'Message content',
            },
            role: {
              type: 'string',
              enum: ['user', 'assistant'],
              description: 'Role of the message sender',
            },
            model: {
              type: 'string',
              enum: ['mistral', 'gemini'],
              description: 'AI model used for this message',
            },
            responseType: {
              type: 'string',
              enum: ['text', 'image'],
              description: 'Type of response (text or image)',
            },
          },
        },
        ChatWithMessages: {
          type: 'object',
          properties: {
            chat: {
              $ref: '#/components/schemas/Chat',
            },
            messages: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Message',
              },
            },
          },
        },
        MessageResponse: {
          type: 'object',
          properties: {
            userMessage: {
              $ref: '#/components/schemas/Message',
            },
            assistantMessage: {
              $ref: '#/components/schemas/Message',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            status: {
              type: 'integer',
              description: 'HTTP status code',
            },
          },
        },
      },
    },
  },
  apis: ['./server/routes.ts', './server/api/*.ts', './server/monitoring.ts'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AI Chat API Documentation',
  }));
  
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}