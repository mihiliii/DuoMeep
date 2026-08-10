import express from 'express';

import { ChatController } from '../controllers/chat.controller.js';

export const chatRouter = express.Router();
const chatController = new ChatController();

chatRouter.get('/:userId', (req, res) => {
  return chatController.listConversations(req, res);
});

chatRouter.get('/:userId/:partnerId', (req, res) => {
  return chatController.listThread(req, res);
});

chatRouter.post('/:senderId/:receiverId', (req, res) => {
  return chatController.createChat(req, res);
});
