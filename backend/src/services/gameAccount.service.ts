import { AppError } from '../errors/errors.js';
import { HTTP_Status } from '../enums/httpStatus.enum.js';
import { Status } from '../enums/status.enum.js';
import { GameAccount, type GameAccountDocument } from '../models/gameAccount.model.js';
import type { CreateGameAccountData } from '../validators/gameAccount.validator.js';

export class GameAccountService {
  async createGameAccount(userId: string, data: CreateGameAccountData): Promise<{ gameAccountId: string }> {
    const { name, region, rank }: CreateGameAccountData = data;

    const [existingName, existingUserAccount]: [GameAccountDocument | null, GameAccountDocument | null] =
      await Promise.all([
        GameAccount.findOne({ name, status: Status.ACTIVE }),
        GameAccount.findOne({ userId, status: Status.ACTIVE }),
      ]);

    if (existingName) {
      throw new AppError('GameAccount name (' + name + ') already exists.', HTTP_Status.CONFLICT);
    }

    if (existingUserAccount) {
      throw new AppError('GameAccount for user id (' + userId + ') already exists.', HTTP_Status.CONFLICT);
    }

    const newGameAccount: GameAccountDocument = await GameAccount.create({ name, region, rank, userId });

    if (!newGameAccount) {
      throw new AppError('Failed to create GameAccount.', HTTP_Status.INTERNAL_SERVER_ERROR);
    }

    return { gameAccountId: newGameAccount._id.toString() };
  }

  async getGameAccountId(name: string): Promise<{ gameAccountId: string }> {
    const gameAccount: GameAccountDocument | null = await GameAccount.findOne({ name, status: Status.ACTIVE });

    if (!gameAccount) {
      throw new AppError('GameAccount (' + name + ') not found.', HTTP_Status.NOT_FOUND);
    }

    return { gameAccountId: gameAccount._id.toString() };
  }

  async getGameAccount(gameAccountId: string): Promise<GameAccountDocument> {
    const gameAccount: GameAccountDocument | null = await GameAccount.findOne({
      _id: gameAccountId,
      status: Status.ACTIVE,
    });

    if (!gameAccount) {
      throw new AppError('GameAccount id (' + gameAccountId + ') not found.', HTTP_Status.NOT_FOUND);
    }

    return gameAccount;
  }

  async updateGameAccount(gameAccountId: string, data: Partial<GameAccountDocument>): Promise<void> {
    if ((await GameAccount.updateOne({ _id: gameAccountId, status: Status.ACTIVE }, data)).matchedCount === 0) {
      throw new AppError('GameAccount id (' + gameAccountId + ') not found.', HTTP_Status.NOT_FOUND);
    }
  }

  async deleteGameAccount(gameAccountId: string): Promise<void> {
    if (
      (await GameAccount.updateOne({ _id: gameAccountId, status: Status.ACTIVE }, { status: Status.DELETED }))
        .matchedCount === 0
    ) {
      throw new AppError('GameAccount id (' + gameAccountId + ') not found.', HTTP_Status.NOT_FOUND);
    }
  }
}
