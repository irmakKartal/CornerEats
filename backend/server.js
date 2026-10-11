import 'dotenv/config';
import express from "express";
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'node:url';
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import promoRouter from './routes/promoRoute.js';
import currencyRouter from './routes/currencyRoute.js';

const app = express();
const port = process.env.PORT || 4000;
const uploadsDirectory = fileURLToPath(new URL('./uploads/', import.meta.url));
app.set('trust proxy', 1);

if (!process.env.JWT_SECRET || !process.env.MONGODB_URI || !process.env.STRIPE_SECRET_KEY) {
  throw new Error('JWT_SECRET, MONGODB_URI, and STRIPE_SECRET_KEY are required');
}

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  ...(process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()),
].filter(Boolean));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiLimiter);
app.use('/api/user/login', authLimiter);
app.use('/api/user/admin-login', authLimiter);
app.use('/api/user/register', authLimiter);

app.use('/api/user', userRouter);
app.use('/api/food', foodRouter);
app.use('/images', express.static(uploadsDirectory, { dotfiles: 'deny', index: false, maxAge: '1d' }));
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/promo', promoRouter);
app.use('/api/currency', currencyRouter);

app.get('/', (_req, res) => res.send('API Working'));

app.use((error, _req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.message === 'Origin is not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Origin is not allowed' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body is too large' });
  }
  console.error('Unhandled request error:', error.message);
  return res.status(500).json({ success: false, message: 'Internal server error' });
});

try {
  await connectDB();
  app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
} catch (error) {
  console.error('Server startup failed:', error.message);
  process.exit(1);
}
