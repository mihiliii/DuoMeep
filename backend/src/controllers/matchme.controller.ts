import type { Request, Response } from 'express';
import type { MatchMeDocument } from '../models/matchme.model.js';
import {
  createMatchMeValidator,
  type CreateMatchMeData,
  updateMatchMeValidator,
  type UpdateMatchMeBody,
} from '../validators/matchme.validator.js';
import { AppError } from '../errors/errors.js';
import { HTTP_Status } from '../enums/httpStatus.enum.js';
import { MatchMeService } from '../services/matchme.service.js';
import { zodParseData } from '../utils/zod.util.js';

export class MatchMeController {
  private matchMeService = new MatchMeService();

  async createMatchMe(req: Request, res: Response): Promise<void> {
    if (!req.params.userId) {
      throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const data: CreateMatchMeData = zodParseData(createMatchMeValidator, req.body);

    const response: { matchMeId: string } = await this.matchMeService.createMatchMe(req.params.userId, data);

    res.status(HTTP_Status.CREATED).json({ message: 'OK', ...response });
  }

  async getMatchMe(req: Request, res: Response): Promise<void> {
    if (!req.params.userId) {
      throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const response: MatchMeDocument = await this.matchMeService.getMatchMe(req.params.userId);

    res.status(HTTP_Status.OK).json({ message: 'OK', ...response });
  }

  async updateMatchMe(req: Request, res: Response): Promise<void> {
    if (!req.params.userId) {
      throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const body: UpdateMatchMeBody = zodParseData(updateMatchMeValidator, req.body);

    await this.matchMeService.updateMatchMe(req.params.userId, body as Partial<MatchMeDocument>);

    res.status(HTTP_Status.OK).json({ message: 'OK' });
  }

  async deleteMatchMe(req: Request, res: Response): Promise<void> {
    if (!req.params.userId) {
      throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    await this.matchMeService.deleteMatchMe(req.params.userId);

    res.status(HTTP_Status.OK).json({ message: 'OK' });
  }
}
