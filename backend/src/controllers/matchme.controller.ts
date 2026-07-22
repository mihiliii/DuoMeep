import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import type { MatchMeDocument } from '../models/matchme.model.js';
import type { GameAccountDocument } from '../models/gameAccount.model.js';
import type { UserInfo } from '../models/user.model.js';
import {
  createMatchMeValidator,
  type CreateMatchMeData,
  updateMatchMeValidator,
  type UpdateMatchMeBody,
  listMatchMeValidator,
  type ListMatchMeQuery,
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

    const matchMe: MatchMeDocument = await this.matchMeService.getMatchMe(req.params.userId);
    const response = matchMe.toObject({ flattenMaps: true });

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

  async listMatchMe(req: Request, res: Response): Promise<void> {
    const query: ListMatchMeQuery = zodParseData(listMatchMeValidator, req.query);

    const { postings, totalCount } = await this.matchMeService.listMatchMe(query);

    const response = postings.map((posting) => {
      const account = posting.accountId as unknown as GameAccountDocument;
      const user = posting.userId as unknown as UserInfo & { _id: Types.ObjectId };
      const { roles, description, requirements } = posting.toObject({ flattenMaps: true });

      return {
        matchMeId: posting._id.toString(),
        userId: user._id.toString(),
        username: user.username,
        avatarPath: `${req.protocol}://${req.get('host')}/${user.avatarPath}`,
        rank: account.rank,
        region: account.region,
        roles,
        description,
        requirements,
      };
    });

    res.status(HTTP_Status.OK).json({
      message: 'OK',
      postings: response,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / query.pageSize)),
      page: query.page,
    });
  }
}
