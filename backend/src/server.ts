import path from 'path';
import express from 'express';
import cors from 'cors';
import type { Express, Request, Response } from 'express';
import connectDB from './config/db.js';
import { userRouter } from './routes/user.routes.js';

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static('public'));

// Connect to MongoDB
connectDB();

// Routes
const router = express.Router();
router.use('/user', userRouter);
app.use('/', router);

// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
