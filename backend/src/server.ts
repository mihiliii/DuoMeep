import path from 'path';
import express from 'express';
import cors from 'cors';
import type { Express, Request, Response } from 'express';
import connectDB from './config/db.js';
import { usersRouter } from './routes/user.routes.js';
import { gameAccountRouter } from './routes/gameAccount.routes.js';
import { matchMeRouter } from './routes/matchme.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

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
app.use('/', router);

// Error handler (must be registered last)
app.use(errorHandler);

// Start server
app.listen(API_PORT, () => {
  console.log(`Server running on port ${API_PORT}`);
});
