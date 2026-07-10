import express from 'express';
import { GameAccountController } from '../controllers/gameAccount.controller.js';

export const gameAccountRouter = express.Router();
const gameAccountController = new GameAccountController();

gameAccountRouter.post('/:userId', (req, res) => {
  return gameAccountController.createGameAccount(req, res);
});

gameAccountRouter.get('/name/:name/id', (req, res) => {
  return gameAccountController.getGameAccountId(req, res);
});

gameAccountRouter.get('/:gameAccountId', (req, res) => {
  return gameAccountController.getGameAccount(req, res);
});

gameAccountRouter.put('/:gameAccountId', (req, res) => {
  return gameAccountController.updateGameAccount(req, res);
});

gameAccountRouter.delete('/:gameAccountId', (req, res) => {
  return gameAccountController.deleteGameAccount(req, res);
});
