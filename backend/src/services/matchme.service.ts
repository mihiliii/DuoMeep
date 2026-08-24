import { GameAccount, type GameAccountDocument } from '../models/gameAccount.model.js';
import { MatchMe, type MatchMeDocument } from '../models/matchme.model.js';
import { User, type UserDocument } from '../models/user.model.js';
import { buildDateRangeFilter } from '../utils/date.util.js';
import { HTTP_Status } from '../utils/enums/httpStatus.enum.js';
import { Status } from '../utils/enums/status.enum.js';
import { AppError } from '../utils/errors/errors.js';
import { escapeRegex } from '../utils/regex.util.js';
import type { CreateMatchMeData, ListMatchMeQuery } from '../utils/validators/matchme.validator.js';

export class MatchMeService {
  async createMatchMe(userId: string, data: CreateMatchMeData): Promise<{ matchMeId: string }> {
    const { roles, description }: CreateMatchMeData = data;

    const [user, gameAccount, matchMe]: [UserDocument | null, GameAccountDocument | null, MatchMeDocument | null] =
      await Promise.all([
        User.findOne({ _id: userId, status: Status.ACTIVE }),
        GameAccount.findOne({ userId, status: Status.ACTIVE }),
        MatchMe.findOne({ userId, status: Status.ACTIVE }),
      ]);

    if (!user) {
      throw new AppError('User id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
    }

    if (!gameAccount) {
      throw new AppError('GameAccount for user id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
    }

    if (matchMe) {
      throw new AppError('MatchMe for user id (' + userId + ') already exists.', HTTP_Status.CONFLICT);
    }

    const newMatchMe: MatchMeDocument = await MatchMe.create({
      userId,
      accountId: gameAccount._id,
      roles,
      description,
    });

    if (!newMatchMe) {
      throw new AppError('Failed to create MatchMe.', HTTP_Status.INTERNAL_SERVER_ERROR);
    }

    return { matchMeId: newMatchMe._id.toString() };
  }

  async getMatchMe(userId: string): Promise<MatchMeDocument> {
    const matchMe: MatchMeDocument | null = await MatchMe.findOne({ userId, status: Status.ACTIVE });

    if (!matchMe) {
      throw new AppError('MatchMe for user id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
    }

    return matchMe;
  }

  async updateMatchMe(userId: string, data: Partial<MatchMeDocument>): Promise<void> {
    if ((await MatchMe.updateOne({ userId, status: Status.ACTIVE }, data)).matchedCount === 0) {
      throw new AppError('MatchMe for user with id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
    }
  }

  async deleteMatchMe(userId: string): Promise<void> {
    if ((await MatchMe.updateOne({ userId, status: Status.ACTIVE }, { status: Status.DELETED })).matchedCount === 0) {
      throw new AppError('MatchMe for user with id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
    }
  }

  async listMatchMe(filters: ListMatchMeQuery): Promise<{ posts: MatchMeDocument[]; totalCount: number }> {
    const { ranks, roles, regions, search, username, account, dateFrom, dateTo, page, pageSize }: ListMatchMeQuery =
      filters;

    const matchMeFilter: Record<string, unknown> = { status: Status.ACTIVE };
    if (roles && roles.length > 0) {
      matchMeFilter.roles = { $in: roles };
    }
    if (search) {
      matchMeFilter.description = { $regex: search, $options: 'i' };
    }
    if (dateFrom || dateTo) {
      matchMeFilter.dateCreated = buildDateRangeFilter(dateFrom, dateTo);
    }

    if (username) {
      matchMeFilter.userId = {
        $in: await User.find({
          username: { $regex: escapeRegex(username), $options: 'i' },
          status: Status.ACTIVE,
        }).distinct('_id'),
      };
    }

    if (account || (ranks && ranks.length > 0) || (regions && regions.length > 0)) {
      const gameAccountFilter: Record<string, unknown> = { status: Status.ACTIVE };

      if (account) {
        gameAccountFilter.name = { $regex: escapeRegex(account), $options: 'i' };
      }
      if (ranks && ranks.length > 0) {
        gameAccountFilter.rank = { $in: ranks };
      }
      if (regions && regions.length > 0) {
        gameAccountFilter.region = { $in: regions };
      }

      matchMeFilter.accountId = { $in: await GameAccount.find(gameAccountFilter).distinct('_id') };
    }

    const [posts, totalCount]: [MatchMeDocument[], number] = await Promise.all([
      MatchMe.find(matchMeFilter)
        .sort({ dateCreated: -1, _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate('accountId')
        .populate('userId', 'username avatarPath tagline'),
      MatchMe.countDocuments(matchMeFilter),
    ]);

    return { posts, totalCount };
  }
}
