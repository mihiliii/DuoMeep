import type { Request, Response } from 'express';
import type { UserDocument } from '../models/user.model.js';
import type { UserDashboard, UserInfo } from '../types/user.type.js';
import {
  createUserValidator,
  type CreateUserData,
  authUserValidator,
  type AuthUserData,
  updateUserValidator,
  type UpdateUserData,
  listUsersValidator,
  type ListUsersQuery,
} from '../validators/user.validator.js';
import { AppError } from '../errors/errors.js';
import { HTTP_Status } from '../enums/httpStatus.enum.js';
import { Status } from '../enums/status.enum.js';
import { UserService } from '../services/user.service.js';
import { GameAccount, type GameAccountDocument } from '../models/gameAccount.model.js';
import { zodParseData } from '../utils/zod.util.js';

export class UserController {
  private userService = new UserService();

  async createUser(req: Request, res: Response): Promise<void> {
    const body: CreateUserData = zodParseData(createUserValidator, req.body);

    const response: { userId: string } = await this.userService.createUser(body);

    res.status(HTTP_Status.CREATED).json({ message: 'OK', ...response });
  }

  async getUserId(req: Request, res: Response): Promise<void> {
    if (!req.params.username) {
      throw new AppError('Username parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const response: { userId: string } = await this.userService.getUserId(req.params.username);

    res.status(HTTP_Status.OK).json({ message: 'OK', ...response });
  }

  async searchUsers(req: Request, res: Response): Promise<void> {
    const query: ListUsersQuery = zodParseData(listUsersValidator, req.query);

    const { users, totalCount } = await this.userService.searchUsers(query);

    const accounts: GameAccountDocument[] = await GameAccount.find(
      { userId: { $in: users.map((user) => user._id) }, status: Status.ACTIVE },
      'userId name rank region',
    );
    const accountByUserId = new Map(accounts.map((account) => [account.userId.toString(), account]));

    const results = users.map((user) => {
      const account: GameAccountDocument | undefined = accountByUserId.get(user._id.toString());

      return {
        userId: user._id.toString(),
        username: user.username,
        avatarPath: `${req.protocol}://${req.get('host')}/${user.avatarPath}`,
        tagline: user.dashboard.tagline,
        accountName: account?.name ?? '',
        rank: account?.rank ?? '',
        region: account?.region ?? '',
      };
    });

    res.status(HTTP_Status.OK).json({
      message: 'OK',
      results,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / query.pageSize)),
      page: query.page,
    });
  }

  async getUserInfo(req: Request, res: Response): Promise<void> {
    if (!req.params.userId) {
      throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const user: UserDocument = await this.userService.getUser(req.params.userId);

    const response: UserInfo = {
      username: user.username,
      avatarPath: `${req.protocol}://${req.get('host')}/${user.avatarPath}`,
    };

    res.status(HTTP_Status.OK).json({ message: 'OK', ...response });
  }

  async getUserDashboard(req: Request, res: Response): Promise<void> {
    if (!req.params.userId) {
      throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const user: UserDocument = await this.userService.getUser(req.params.userId);

    const response: UserDashboard = {
      ...user.dashboard,
      banner: user.dashboard.banner ? `${req.protocol}://${req.get('host')}/${user.dashboard.banner}` : '',
    };

    res.status(HTTP_Status.OK).json({ message: 'OK', ...response });
  }

  async getUserEmail(req: Request, res: Response): Promise<void> {
    if (!req.params.userId) {
      throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const email: string = await this.userService.getUserEmail(req.params.userId);

    res.status(HTTP_Status.OK).json({ message: 'OK', email });
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    if (!req.params.userId) {
      throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const body: UpdateUserData = zodParseData(updateUserValidator, req.body);

    await this.userService.updateUser(req.params.userId, body as Partial<UserDocument>);

    res.status(HTTP_Status.OK).json({ message: 'OK' });
  }

  async updateUserAvatar(req: Request, res: Response): Promise<void> {
    if (!req.params.userId) {
      throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    if (!req.file) {
      throw new AppError('No file uploaded.', HTTP_Status.BAD_REQUEST);
    }

    await this.userService.updateUser(req.params.userId, { avatarPath: req.file.path });

    res.status(HTTP_Status.OK).json({ message: 'Avatar updated successfully.' });
  }

  async updateUserBanner(req: Request, res: Response): Promise<void> {
    if (!req.params.userId) {
      throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    if (!req.file) {
      throw new AppError('No file uploaded.', HTTP_Status.BAD_REQUEST);
    }

    await this.userService.updateUser(req.params.userId, {
      dashboard: { banner: req.file.path },
    } as Partial<UserDocument>);

    res.status(HTTP_Status.OK).json({ message: 'Banner updated successfully.' });
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    if (!req.params.userId) {
      throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    await this.userService.deleteUser(req.params.userId);

    res.status(HTTP_Status.OK).json({ message: 'OK' });
  }

  async authUser(req: Request, res: Response): Promise<void> {
    const body: AuthUserData = zodParseData(authUserValidator, req.body);

    const result: { userId: string } = await this.userService.authUser(body);

    res.status(HTTP_Status.OK).json({ message: 'Login success.', ...result });
  }
}
