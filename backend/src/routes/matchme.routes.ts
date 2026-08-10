import express from 'express';

import { MatchMeController } from '../controllers/matchme.controller.js';

export const matchMeRouter = express.Router();
const matchMeController = new MatchMeController();

matchMeRouter.get('/', (req, res) => {
  return matchMeController.listMatchMe(req, res);
});

matchMeRouter.post('/:userId', (req, res) => {
  return matchMeController.createMatchMe(req, res);
});

matchMeRouter.get('/:userId', (req, res) => {
  return matchMeController.getMatchMe(req, res);
});

matchMeRouter.put('/:userId', (req, res) => {
  return matchMeController.updateMatchMe(req, res);
});

matchMeRouter.delete('/:userId', (req, res) => {
  return matchMeController.deleteMatchMe(req, res);
});
