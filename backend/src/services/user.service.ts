import argon2 from 'argon2';

import { GameAccount } from '../models/gameAccount.model.js';
import { MatchMe } from '../models/matchme.model.js';
import { Review } from '../models/review.model.js';
import { User, type UserDocument } from '../models/user.model.js';
import { buildDateRangeFilter } from '../utils/date.util.js';
import { HTTP_Status } from '../utils/enums/httpStatus.enum.js';
import { Status } from '../utils/enums/status.enum.js';
import { AppError } from '../utils/errors/errors.js';
import { escapeRegex } from '../utils/regex.util.js';
import type { AuthUserData, CreateUserData, ListUsersQuery } from '../utils/validators/user.validator.js';

export class UserService {
  async createUser(body: CreateUserData): Promise<{ userId: string }> {
    const { username, email, password }: CreateUserData = body;

    const existingUser: UserDocument | null = await User.findOne({
      $or: [{ username }, { 'authInfo.email': email }],
      status: Status.ACTIVE,
    }).select('+authInfo.email +authInfo.password');

    if (existingUser) {
      let message: string = '';
      if (existingUser.username === username) {
        message += 'Username already exists. ';
      }
      if (existingUser.authInfo.email === email) {
        message += 'Email already exists. ';
      }
      throw new AppError(message.trim(), HTTP_Status.CONFLICT);
    }

    const newUser: UserDocument = await User.create({
      username,
      authInfo: { email, password: await argon2.hash(email + password) },
    });

    return { userId: newUser._id.toString() };
  }

  async getUserId(username: string): Promise<{ userId: string }> {
    const user: UserDocument | null = await User.findOne({ username, status: Status.ACTIVE });

    if (!user) {
      throw new AppError('User (' + username + ') not found.', HTTP_Status.NOT_FOUND);
    }

    return { userId: user._id.toString() };
  }

  async searchUsers(query: ListUsersQuery): Promise<{ users: UserDocument[]; totalCount: number }> {
    const { username, account, ranks, regions, dateFrom, dateTo, page, pageSize }: ListUsersQuery = query;

    const filter: Record<string, unknown> = { status: Status.ACTIVE };

    if (username) {
      filter.username = { $regex: escapeRegex(username), $options: 'i' };
    }

    if (account || (ranks && ranks.length > 0) || (regions && regions.length > 0)) {
      const accountFilter: Record<string, unknown> = { status: Status.ACTIVE };

      if (account) {
        accountFilter.name = { $regex: escapeRegex(account), $options: 'i' };
      }
      if (ranks && ranks.length > 0) {
        accountFilter.rank = { $in: ranks };
      }
      if (regions && regions.length > 0) {
        accountFilter.region = { $in: regions };
      }

      filter._id = { $in: await GameAccount.find(accountFilter).distinct('userId') };
    }

    if (dateFrom || dateTo) {
      filter.dateCreated = buildDateRangeFilter(dateFrom, dateTo);
    }

    const [users, totalCount]: [UserDocument[], number] = await Promise.all([
      User.find(filter)
        .sort({ username: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      User.countDocuments(filter),
    ]);

    return { users, totalCount };
  }

  async getUser(userId: string): Promise<UserDocument> {
    const user: UserDocument | null = await User.findOne({ _id: userId, status: Status.ACTIVE });

    if (!user) {
      throw new AppError('User id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
    }

    return user;
  }

  async updateUser(userId: string, data: Partial<UserDocument>): Promise<void> {
    const { username, avatarPath, bio, tagline, banner, authInfo, status } = data;
    const updateValues: Record<string, unknown> = { username, avatarPath, bio, tagline, banner };

    if (authInfo) {
      if (authInfo.password) {
        const email: string = authInfo.email || (await this.getUserEmail(userId));
        authInfo.password = await argon2.hash(email + authInfo.password);
      }

      for (const [key, value] of Object.entries(authInfo)) {
        updateValues[`authInfo.${key}`] = value;
      }
    }

    if (
      (await User.updateOne({ _id: userId, status: Status.ACTIVE }, { $set: updateValues }, { runValidators: true }))
        .matchedCount === 0
    ) {
      throw new AppError('User id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
    }
  }

  async getUserEmail(userId: string): Promise<string> {
    const user: UserDocument | null = await User.findOne({ _id: userId, status: Status.ACTIVE }).select(
      '+authInfo.email +authInfo.password',
    );

    if (!user) {
      throw new AppError('User id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
    }

    return user.authInfo.email;
  }

  async authUser(body: AuthUserData): Promise<{ userId: string }> {
    const { email, password }: AuthUserData = body;

    const user: UserDocument | null = await User.findOne({ 'authInfo.email': email, status: Status.ACTIVE }).select(
      '+authInfo.email +authInfo.password',
    );

    if (!user || !(await argon2.verify(user.authInfo.password, email + password))) {
      throw new AppError('Invalid credentials.', HTTP_Status.UNAUTHORIZED);
    }

    return { userId: user._id.toString() };
  }

  async deleteUser(userId: string): Promise<void> {
    if ((await User.updateOne({ _id: userId, status: Status.ACTIVE }, { status: Status.DELETED })).matchedCount === 0) {
      throw new AppError('User id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
    }

    await Promise.all([
      GameAccount.updateMany({ userId, status: Status.ACTIVE }, { status: Status.DELETED }),
      MatchMe.updateMany({ userId, status: Status.ACTIVE }, { status: Status.DELETED }),
      Review.updateMany({ reviewerId: userId, status: Status.ACTIVE }, { status: Status.DELETED }),
    ]);
  }
}
