import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import type { MatchMeDocument } from '../models/matchme.model.js';
import type { GameAccountDocument } from '../models/gameAccount.model.js';
import type { UserInfo } from '../types/user.type.js';
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
    const response = matchMe.toObject();

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

    const { posts, totalCount } = await this.matchMeService.listMatchMe(query);

    const response = posts.map((post) => {
      const account = post.accountId as unknown as GameAccountDocument;
      const user = post.userId as unknown as UserInfo & { _id: Types.ObjectId; dashboard: { tagline: string } };
      const { roles, description } = post.toObject();

      return {
        matchMeId: post._id.toString(),
        userId: user._id.toString(),
        username: user.username,
        tagline: user.dashboard.tagline,
        avatarPath: `${req.protocol}://${req.get('host')}/${user.avatarPath}`,
        accountName: account.name,
        rank: account.rank,
        region: account.region,
        roles,
        description,
        dateCreated: post.dateCreated,
      };
    });

    res.status(HTTP_Status.OK).json({
      message: 'OK',
      posts: response,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / query.pageSize)),
      page: query.page,
    });
  }
}
