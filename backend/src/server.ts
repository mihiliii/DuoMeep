import path from 'path';
import cors from 'cors';
import express from 'express';
import type { Express, Request, Response } from 'express';

import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { adminRouter } from './routes/admin.routes.js';
import { chatRouter } from './routes/chat.routes.js';
import { gameAccountRouter } from './routes/gameAccount.routes.js';
import { matchMeRouter } from './routes/matchme.routes.js';
import { reviewRouter } from './routes/review.routes.js';
import { usersRouter } from './routes/user.routes.js';

const app: Express = express();
const API_PORT = process.env.API_PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static('public'));
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
connectDB();

// Routes
const router = express.Router();
router.use('/users', usersRouter);
router.use('/gameaccounts', gameAccountRouter);
router.use('/matchme', matchMeRouter);
router.use('/reviews', reviewRouter);
router.use('/chats', chatRouter);
router.use('/admin', adminRouter);
app.use('/', router);

// Error handler (must be registered last)
app.use(errorHandler);

// Start server
app.listen(API_PORT, () => {
  console.log(`Server running on port ${API_PORT}`);
});
