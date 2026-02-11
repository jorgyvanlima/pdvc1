import 'express-async-errors';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import pinoHttp from 'pino-http';
import pino from 'pino';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import productRoutes from './routes/products.routes';
import categoryRoutes from './routes/categories.routes';
import customerRoutes from './routes/customers.routes';
import supplierRoutes from './routes/suppliers.routes';
import saleRoutes from './routes/sales.routes';
import purchaseRoutes from './routes/purchases.routes';
import paymentRoutes from './routes/payments.routes';
import cashRegisterRoutes from './routes/cashRegister.routes';
import reportRoutes from './routes/reports.routes';
import dashboardRoutes from './routes/dashboard.routes';
import financialRoutes from './routes/financial.routes';

// Error handling
import { errorHandler } from './middleware/errorHandler';
import { asyncHandler } from './middleware/asyncHandler';

// Constants
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Logger setup
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    NODE_ENV === 'development'
      ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: true,
        },
      }
      : undefined,
});

// Create Express app
const app: Express = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware - Security
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware - Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Middleware - Logging
app.use(pinoHttp({ logger }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});


// ... (existing imports)

// API Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/customers`, customerRoutes);
app.use(`${API_PREFIX}/suppliers`, supplierRoutes);
app.use(`${API_PREFIX}/sales`, saleRoutes);
app.use(`${API_PREFIX}/purchases`, purchaseRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/cash-register`, cashRegisterRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/finance`, financialRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // POS events
  socket.on('pos:update-cart', (data) => {
    io.emit('pos:cart-updated', data);
  });

  socket.on('pos:sale-completed', (data) => {
    io.emit('sale:new', data);
  });

  // Cash register events
  socket.on('register:opened', (data) => {
    io.emit('register:status-changed', {
      ...data,
      status: 'opened',
    });
  });

  socket.on('register:closed', (data) => {
    io.emit('register:status-changed', {
      ...data,
      status: 'closed',
    });
  });

  // Real-time dashboard updates
  socket.on('dashboard:subscribe', () => {
    socket.join('dashboard');
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Global error handler for unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(
    `✅ Server running at http://localhost:${PORT}${API_PREFIX}`,
  );
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
});

export { app, server, io, logger };
