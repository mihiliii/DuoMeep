import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import type { ReviewDocument } from '../models/review.model.js';
import type { UserInfo } from '../models/user.model.js';
import {
  createReviewValidator,
  type CreateReviewData,
  updateReviewValidator,
  type UpdateReviewData,
  listReviewValidator,
  type ListReviewQuery,
} from '../validators/review.validator.js';
import { AppError } from '../errors/errors.js';
import { HTTP_Status } from '../enums/httpStatus.enum.js';
import { ReviewService } from '../services/review.service.js';
import { zodParseData } from '../utils/zod.util.js';

export class ReviewController {
  private reviewService = new ReviewService();

  async createReview(req: Request, res: Response): Promise<void> {
    if (!req.params.reviewerId || !req.params.targetId) {
      throw new AppError('Reviewer Id and Target Id parameters are required.', HTTP_Status.BAD_REQUEST);
    }

    const data: CreateReviewData = zodParseData(createReviewValidator, req.body);

    const response: { reviewId: string } = await this.reviewService.createReview(
      req.params.reviewerId,
      req.params.targetId,
      data,
    );

    res.status(HTTP_Status.CREATED).json({ message: 'OK', ...response });
  }

  async getReview(req: Request, res: Response): Promise<void> {
    if (!req.params.reviewerId || !req.params.targetId) {
      throw new AppError('Reviewer Id and Target Id parameters are required.', HTTP_Status.BAD_REQUEST);
    }

    const review: ReviewDocument = await this.reviewService.getReview(req.params.reviewerId, req.params.targetId);
    const response = review.toObject();

    res.status(HTTP_Status.OK).json({ message: 'OK', ...response });
  }

  async updateReview(req: Request, res: Response): Promise<void> {
    if (!req.params.reviewerId || !req.params.targetId) {
      throw new AppError('Reviewer Id and Target Id parameters are required.', HTTP_Status.BAD_REQUEST);
    }

    const body: UpdateReviewData = zodParseData(updateReviewValidator, req.body);

    await this.reviewService.updateReview(req.params.reviewerId, req.params.targetId, body);

    res.status(HTTP_Status.OK).json({ message: 'OK' });
  }

  async deleteReview(req: Request, res: Response): Promise<void> {
    if (!req.params.reviewerId || !req.params.targetId) {
      throw new AppError('Reviewer Id and Target Id parameters are required.', HTTP_Status.BAD_REQUEST);
    }

    await this.reviewService.deleteReview(req.params.reviewerId, req.params.targetId);

    res.status(HTTP_Status.OK).json({ message: 'OK' });
  }

  async listReviews(req: Request, res: Response): Promise<void> {
    if (!req.params.targetId) {
      throw new AppError('Target Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const query: ListReviewQuery = zodParseData(listReviewValidator, req.query);

    const { reviews, totalCount, likeCount, dislikeCount } = await this.reviewService.listReviewsForTarget(
      req.params.targetId,
      query.page,
      query.pageSize,
    );

    const response = reviews.map((review) => {
      const reviewer = review.reviewerId as unknown as UserInfo & { _id: Types.ObjectId };
      const { comment, isLike, date } = review.toObject();

      return {
        reviewId: review._id.toString(),
        reviewerId: reviewer._id.toString(),
        username: reviewer.username,
        avatarPath: `${req.protocol}://${req.get('host')}/${reviewer.avatarPath}`,
        comment,
        isLike,
        date,
      };
    });

    res.status(HTTP_Status.OK).json({
      message: 'OK',
      reviews: response,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / query.pageSize)),
      page: query.page,
      likeCount,
      dislikeCount,
    });
  }
}
