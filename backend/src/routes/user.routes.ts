import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { uploadProfilePicture } from '../config/multer.js';

import authMiddleware from '../middleware/auth.js';

export const userRouter = express.Router();
const userController = new UserController();

userRouter.post('/login', (req, res) => {
	userController.login(req, res);
});

userRouter.post('/register', (req, res) => {
	userController.register(req, res);
});

userRouter.post('/uploadProfilePicture', uploadProfilePicture, (req, res) => {
	userController.uploadProfilePicture(req, res);
});

userRouter.get('/get/:id', authMiddleware, (req, res) => {
	userController.getUserInfo(req, res);
});

userRouter.put('/update/:id', (req, res) => {
	userController.updateUserInfo(req, res);
});
