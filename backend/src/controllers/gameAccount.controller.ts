import type { Request, Response } from 'express';
import type { GameAccountDocument } from '../models/gameAccount.model.js';
import {
  createGameAccountValidator,
  type CreateGameAccountData,
  updateGameAccountValidator,
  type UpdateGameAccountData,
} from '../validators/gameAccount.validator.js';
import { AppError } from '../errors/errors.js';
import { HTTP_Status } from '../enums/httpStatus.enum.js';
import { GameAccountService } from '../services/gameAccount.service.js';
import { zodParseData } from '../utils/zod.util.js';

export class GameAccountController {
  private gameAccountService = new GameAccountService();

  async createGameAccount(req: Request, res: Response): Promise<void> {
    if (!req.params.userId) {
      throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const data: CreateGameAccountData = zodParseData(createGameAccountValidator, req.body);

    const response: { gameAccountId: string } = await this.gameAccountService.createGameAccount(
      req.params.userId,
      data,
    );

    res.status(HTTP_Status.CREATED).json({ message: 'OK', ...response });
  }

  async getGameAccountId(req: Request, res: Response): Promise<void> {
    if (!req.params.name) {
      throw new AppError('Name parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const response: { gameAccountId: string } = await this.gameAccountService.getGameAccountId(req.params.name);

    res.status(HTTP_Status.OK).json({ message: 'OK', ...response });
  }

  async getGameAccount(req: Request, res: Response): Promise<void> {
    if (!req.params.gameAccountId) {
      throw new AppError('GameAccount Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const gameAccount: GameAccountDocument = await this.gameAccountService.getGameAccount(req.params.gameAccountId);

    res.status(HTTP_Status.OK).json(gameAccount);
  }

  async getGameAccountByUserId(req: Request, res: Response): Promise<void> {
    if (!req.params.userId) {
      throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const gameAccount: GameAccountDocument = await this.gameAccountService.getGameAccountByUserId(req.params.userId);

    res.status(HTTP_Status.OK).json(gameAccount);
  }

  async updateGameAccount(req: Request, res: Response): Promise<void> {
    if (!req.params.gameAccountId) {
      throw new AppError('GameAccount Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const body: UpdateGameAccountData = zodParseData(updateGameAccountValidator, req.body);

    await this.gameAccountService.updateGameAccount(req.params.gameAccountId, body as Partial<GameAccountDocument>);

    res.status(HTTP_Status.OK).json({ message: 'OK' });
  }

  async deleteGameAccount(req: Request, res: Response): Promise<void> {
    if (!req.params.gameAccountId) {
      throw new AppError('GameAccount Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    await this.gameAccountService.deleteGameAccount(req.params.gameAccountId);

    res.status(HTTP_Status.OK).json({ message: 'OK' });
  }
}
