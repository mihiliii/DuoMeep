import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { uploadAvatar, uploadBanner } from '../config/multer.js';

export const usersRouter = express.Router();
const userController = new UserController();

usersRouter.post('/register', (req, res) => {
  return userController.createUser(req, res);
});

usersRouter.post('/login', (req, res) => {
  return userController.authUser(req, res);
});

usersRouter.get('/username/:username/id', (req, res) => {
  return userController.getUserId(req, res);
});

usersRouter.get('/:userId/info', (req, res) => {
  return userController.getUserInfo(req, res);
});

usersRouter.get('/:userId/dashboard', (req, res) => {
  return userController.getUserDashboard(req, res);
});

usersRouter.put('/:userId', (req, res) => {
  return userController.updateUser(req, res);
});

usersRouter.put('/:userId/avatar', uploadAvatar, (req, res) => {
  return userController.updateUserAvatar(req, res);
});

usersRouter.put('/:userId/banner', uploadBanner, (req, res) => {
  return userController.updateUserBanner(req, res);
});
