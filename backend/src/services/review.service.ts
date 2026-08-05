import { AppError } from '../errors/errors.js';
import { HTTP_Status } from '../enums/httpStatus.enum.js';
import { Status } from '../enums/status.enum.js';
import { User, type UserDocument } from '../models/user.model.js';
import { Review, type ReviewDocument } from '../models/review.model.js';
import type { CreateReviewData, UpdateReviewData } from '../validators/review.validator.js';

export class ReviewService {
  async createReview(reviewerId: string, targetId: string, data: CreateReviewData): Promise<{ reviewId: string }> {
    const { comment }: CreateReviewData = data;

    if (reviewerId === targetId) {
      throw new AppError('Cannot review yourself.', HTTP_Status.BAD_REQUEST);
    }

    const [targetUser, existingReview]: [UserDocument | null, ReviewDocument | null] = await Promise.all([
      User.findOne({ _id: targetId, status: Status.ACTIVE }),
      Review.findOne({ reviewerId, targetId, status: Status.ACTIVE }),
    ]);

    if (!targetUser) {
      throw new AppError('User id (' + targetId + ') not found.', HTTP_Status.NOT_FOUND);
    }

    if (existingReview) {
      throw new AppError('Review for target id (' + targetId + ') already exists.', HTTP_Status.CONFLICT);
    }

    const newReview: ReviewDocument = await Review.create({ reviewerId, targetId, comment });

    if (!newReview) {
      throw new AppError('Failed to create Review.', HTTP_Status.INTERNAL_SERVER_ERROR);
    }

    return { reviewId: newReview._id.toString() };
  }

  async getReview(reviewerId: string, targetId: string): Promise<ReviewDocument> {
    const review: ReviewDocument | null = await Review.findOne({ reviewerId, targetId, status: Status.ACTIVE });

    if (!review) {
      throw new AppError('Review not found.', HTTP_Status.NOT_FOUND);
    }

    return review;
  }

  async listReviewsForTarget(
    targetId: string,
    page: number,
    pageSize: number,
  ): Promise<{ reviews: ReviewDocument[]; totalCount: number }> {
    const filter: Record<string, unknown> = { targetId, status: Status.ACTIVE };

    const [reviews, totalCount]: [ReviewDocument[], number] = await Promise.all([
      Review.find(filter)
        .sort({ date: -1, _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate('reviewerId', 'username avatarPath'),
      Review.countDocuments(filter),
    ]);

    return { reviews, totalCount };
  }

  async updateReview(reviewerId: string, targetId: string, data: UpdateReviewData): Promise<void> {
    if ((await Review.updateOne({ reviewerId, targetId, status: Status.ACTIVE }, data)).matchedCount === 0) {
      throw new AppError('Review not found.', HTTP_Status.NOT_FOUND);
    }
  }

  async deleteReview(reviewerId: string, targetId: string): Promise<void> {
    if (
      (await Review.updateOne({ reviewerId, targetId, status: Status.ACTIVE }, { status: Status.DELETED }))
        .matchedCount === 0
    ) {
      throw new AppError('Review not found.', HTTP_Status.NOT_FOUND);
    }
  }
}
