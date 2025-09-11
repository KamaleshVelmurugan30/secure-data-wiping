import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { pino } from 'pino';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import agentRoutes from './routes/agents.js';
import wipeRoutes from './routes/wipes.js';
import certificateRoutes from './routes/certificates.js';
import blockchainRoutes from './routes/blockchain.js';
import deliveryRoutes from './routes/deliveries.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupBullMQ } from './services/bullmq.js';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
});

const app = express();
const port = process.env.PORT || 3001;

// Initialize Prisma client
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
}));

app.use(pinoHttp({ logger }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Health checks
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: 'Database connection failed' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/wipes', wipeRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/deliveries', deliveryRoutes);

// Error handling
app.use(errorHandler);

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down server...');
  try {
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const startServer = async () => {
  try {
    // Initialize BullMQ
    await setupBullMQ();
    
    // Connect to database
    await prisma.$connect();
    logger.info('Database connected successfully');

    app.listen(port, () => {
      logger.info(`TrustWipe backend server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();