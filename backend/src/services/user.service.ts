import argon2 from 'argon2';
import { AppError } from '../errors/errors.js';
import { HTTP_Status } from '../enums/httpStatus.enum.js';
import { Status } from '../enums/status.enum.js';
import { User, type UserDocument } from '../models/user.model.js';
import type { CreateUserData, AuthUserData } from '../validators/user.validator.js';

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

  async getUser(userId: string): Promise<UserDocument> {
    const user: UserDocument | null = await User.findOne({ _id: userId, status: Status.ACTIVE });

    if (!user) {
      throw new AppError('User id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
    }

    return user;
  }

  async updateUser(userId: string, data: Partial<UserDocument>): Promise<void> {
    const { username, avatarPath, dashboard, authInfo, status } = data;
    const updateValues: Record<string, unknown> = { username, avatarPath };

    if (dashboard) {
      for (const [key, value] of Object.entries(dashboard)) {
        updateValues[`dashboard.${key}`] = value;
      }
    }

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

  async updateUserBanner(userId: string, bannerPath: string): Promise<void> {
    if (
      (await User.updateOne({ _id: userId, status: Status.ACTIVE }, { $set: { 'dashboard.banner': bannerPath } }))
        .matchedCount === 0
    ) {
      throw new AppError('User id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
    }
  }

  private async getUserEmail(userId: string): Promise<string> {
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
  }
}
