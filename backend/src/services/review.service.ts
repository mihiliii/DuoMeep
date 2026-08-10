import type { Types } from 'mongoose';

import { HTTP_Status } from '../enums/httpStatus.enum.js';
import { Status } from '../enums/status.enum.js';
import { AppError } from '../errors/errors.js';
import { Review, type ReviewDocument } from '../models/review.model.js';
import { User, type UserDocument } from '../models/user.model.js';
import { buildDateRangeFilter } from '../utils/date.util.js';
import { escapeRegex } from '../utils/regex.util.js';
import type { CreateReviewData, ListAllReviewsQuery } from '../validators/review.validator.js';

export class ReviewService {
  async createReview(reviewerId: string, targetId: string, data: CreateReviewData): Promise<{ reviewId: string }> {
    const { comment }: CreateReviewData = data;

    if (reviewerId === targetId) {
      throw new AppError('Cannot review yourself.', HTTP_Status.BAD_REQUEST);
    }

    const targetUser: UserDocument | null = await User.findOne({ _id: targetId, status: Status.ACTIVE });

    if (!targetUser) {
      throw new AppError('User id (' + targetId + ') not found.', HTTP_Status.NOT_FOUND);
    }

    const newReview: ReviewDocument = await Review.create({ reviewerId, targetId, comment });

    if (!newReview) {
      throw new AppError('Failed to create Review.', HTTP_Status.INTERNAL_SERVER_ERROR);
    }

    return { reviewId: newReview._id.toString() };
  }

  async listReviewsForTarget(
    targetId: string,
    page: number,
    pageSize: number,
  ): Promise<{ reviews: ReviewDocument[]; totalCount: number }> {
    const filter: Record<string, unknown> = { targetId, status: Status.ACTIVE };

    const [reviews, totalCount]: [ReviewDocument[], number] = await Promise.all([
      Review.find(filter)
        .sort({ dateCreated: -1, _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate('reviewerId', 'username avatarPath'),
      Review.countDocuments(filter),
    ]);

    return { reviews, totalCount };
  }

  private async findUserIdsByUsername(username: string): Promise<Types.ObjectId[]> {
    return User.find({
      username: { $regex: escapeRegex(username), $options: 'i' },
      status: Status.ACTIVE,
    }).distinct('_id');
  }

  async listAllReviews(query: ListAllReviewsQuery): Promise<{ reviews: ReviewDocument[]; totalCount: number }> {
    const { reviewer, target, comment, dateFrom, dateTo, page, pageSize }: ListAllReviewsQuery = query;

    const filter: Record<string, unknown> = { status: Status.ACTIVE };

    if (comment) {
      filter.comment = { $regex: escapeRegex(comment), $options: 'i' };
    }

    if (reviewer) {
      filter.reviewerId = { $in: await this.findUserIdsByUsername(reviewer) };
    }

    if (target) {
      filter.targetId = { $in: await this.findUserIdsByUsername(target) };
    }

    if (dateFrom || dateTo) {
      filter.dateCreated = buildDateRangeFilter(dateFrom, dateTo);
    }

    const [reviews, totalCount]: [ReviewDocument[], number] = await Promise.all([
      Review.find(filter)
        .sort({ dateCreated: -1, _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate('reviewerId', 'username avatarPath')
        .populate('targetId', 'username avatarPath'),
      Review.countDocuments(filter),
    ]);

    return { reviews, totalCount };
  }

  async deleteReview(reviewId: string, reviewerId?: string): Promise<void> {
    const filter: Record<string, unknown> = { _id: reviewId, status: Status.ACTIVE };

    if (reviewerId) {
      filter.reviewerId = reviewerId;
    }

    if ((await Review.updateOne(filter, { status: Status.DELETED })).matchedCount === 0) {
      throw new AppError('Review not found.', HTTP_Status.NOT_FOUND);
    }
  }
}
