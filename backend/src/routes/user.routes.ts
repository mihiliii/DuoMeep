import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { uploadProfilePicture } from '../config/multer.js';

export const usersRouter = express.Router();
const userController = new UserController();

usersRouter.post('/login', (req, res) => {
	userController.login(req, res);
});

usersRouter.post('/register', (req, res) => {
	userController.register(req, res);
});

usersRouter.post('/avatar', uploadProfilePicture, (req, res) => {
	userController.updateUserAvatar(req, res);
});

usersRouter.get('/username/:username/id', (req, res) => {
	userController.getUserId(req, res);
});

usersRouter.get('/:userId/info', (req, res) => {
	userController.getUserInfo(req, res);
});

usersRouter.get('/:userId/profile', (req, res) => {
	userController.getUserProfile(req, res);
});

usersRouter.put('/:userId/info', (req, res) => {
	userController.updateUserInfo(req, res);
});

usersRouter.get('/username/:username/dashboard', (req, res) => {
	userController.getUserDashboard(req, res);
});
