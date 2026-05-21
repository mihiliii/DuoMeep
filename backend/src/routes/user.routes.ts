import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { uploadProfilePicture } from '../config/multer.js';

export const userRouter = express.Router();
const userController = new UserController();

userRouter.post('/login', (req, res) => {
	userController.login(req, res);
});

userRouter.post('/register', (req, res) => {
	userController.register(req, res);
});

userRouter.post('/updateUserProfilePicture', uploadProfilePicture, (req, res) => {
	userController.updateUserAvatar(req, res);
});

userRouter.get('/getUserId/:username', (req, res) => {
	userController.getUserId(req, res);
});

userRouter.get('/getUserInfo/:userId', (req, res) => {
	userController.getUserInfo(req, res);
});

userRouter.put('/updateUserInfo/:userId', (req, res) => {
	userController.updateUserInfo(req, res);
});
