import path from 'path';
import express from 'express';
import cors from 'cors';
import type { Express, Request, Response } from 'express';
import connectDB from './config/db.js';
import { usersRouter } from './routes/user.routes.js';

const app: Express = express();
const API_PORT = process.env.API_PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static('public'));

// Connect to MongoDB
connectDB();

// Routes
const router = express.Router();
router.use('/users', usersRouter);
app.use('/', router);

// Start server
app.listen(API_PORT, () => {
	console.log(`Server running on port ${API_PORT}`);
});
