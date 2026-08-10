import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import cubeRouter from './routes/cube.routes.js';
import storeRouter from './routes/store.routes.js';
import authRouter from './routes/auth.routes.js';
import { enforcePublicReadOnly } from './middleware/public-demo.middleware.js';


dotenv.config();

const app = express();
const port = Number.parseInt(process.env.PORT || '4242', 10);
const appDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = process.env.FRONTEND_DIR || path.join(appDirectory, 'frontend');
const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      frameSrc: ['https://js.stripe.com', 'https://checkout.stripe.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'", 'https://checkout.stripe.com'],
      upgradeInsecureRequests: null
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(enforcePublicReadOnly);
app.use(express.urlencoded({ extended: false, limit: '25kb' }));
app.use(express.json({ limit: '100kb' }));

if (configuredOrigins.length > 0) {
  app.use(cors({
    origin(origin, callback) {
      if (!origin || configuredOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: false
  }));
}

app.use('/static', express.static(path.join(appDirectory, 'cubes'), {
  dotfiles: 'deny',
  index: false,
  maxAge: '1d'
}));

app.get('/healthz', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'database-unavailable',
    mode: process.env.PUBLIC_READ_ONLY === 'true' ? 'public-read-only' : 'standard'
  });
});

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 180,
  standardHeaders: 'draft-8',
  legacyHeaders: false
});
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false
});

app.use('/api', apiLimiter);
app.use('/api', cubeRouter);
app.use('/api/auth', sensitiveLimiter, authRouter);
app.use('/checkout', sensitiveLimiter);
app.use('/', storeRouter);

app.use(express.static(frontendDirectory, {
  setHeaders: (res, filePath) => {
    const isMutableEntry = filePath.endsWith('index.html') || filePath.endsWith('assets/env.js');
    res.setHeader('Cache-Control', isMutableEntry ? 'no-cache' : 'public, max-age=31536000, immutable');
  }
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDirectory, 'index.html'));
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  console.error(error);
  return res.status(error.status || 500).json({ error: 'Request failed.' });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
