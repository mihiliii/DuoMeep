import type { Request, Response } from 'express';
import type { Types } from 'mongoose';

import { ReviewService } from '../services/review.service.js';
import { HTTP_Status } from '../utils/enums/httpStatus.enum.js';
import { AppError } from '../utils/errors/errors.js';
import type { UserInfo } from '../utils/types/user.type.js';
import {
  createReviewValidator,
  listAllReviewsValidator,
  listReviewValidator,
  type CreateReviewData,
  type ListAllReviewsQuery,
  type ListReviewQuery,
} from '../utils/validators/review.validator.js';
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

  async deleteReview(req: Request, res: Response): Promise<void> {
    if (!req.params.reviewerId || !req.params.reviewId) {
      throw new AppError('Reviewer Id and Review Id parameters are required.', HTTP_Status.BAD_REQUEST);
    }

    await this.reviewService.deleteReview(req.params.reviewId, req.params.reviewerId);

    res.status(HTTP_Status.OK).json({ message: 'OK' });
  }

  async deleteReviewAsAdmin(req: Request, res: Response): Promise<void> {
    if (!req.params.reviewId) {
      throw new AppError('Review Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    await this.reviewService.deleteReview(req.params.reviewId);

    res.status(HTTP_Status.OK).json({ message: 'OK' });
  }

  async listAllReviews(req: Request, res: Response): Promise<void> {
    const query: ListAllReviewsQuery = zodParseData(listAllReviewsValidator, req.query);

    const { reviews, totalCount } = await this.reviewService.listAllReviews(query);

    const host: string = `${req.protocol}://${req.get('host')}`;

    const response = reviews.map((review) => {
      const reviewer = review.reviewerId as unknown as UserInfo & { _id: Types.ObjectId };
      const target = review.targetId as unknown as UserInfo & { _id: Types.ObjectId };
      const { comment } = review.toObject();

      return {
        reviewId: review._id.toString(),
        reviewerId: reviewer._id.toString(),
        reviewerUsername: reviewer.username,
        reviewerAvatarPath: `${host}/${reviewer.avatarPath}`,
        targetId: target._id.toString(),
        targetUsername: target.username,
        targetAvatarPath: `${host}/${target.avatarPath}`,
        comment,
        date: review.dateCreated,
      };
    });

    res.status(HTTP_Status.OK).json({
      message: 'OK',
      reviews: response,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / query.pageSize)),
      page: query.page,
    });
  }

  async listReviews(req: Request, res: Response): Promise<void> {
    if (!req.params.targetId) {
      throw new AppError('Target Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const query: ListReviewQuery = zodParseData(listReviewValidator, req.query);

    const { reviews, totalCount } = await this.reviewService.listReviewsForTarget(
      req.params.targetId,
      query.page,
      query.pageSize,
    );

    const response = reviews.map((review) => {
      const reviewer = review.reviewerId as unknown as UserInfo & { _id: Types.ObjectId };
      const { comment } = review.toObject();

      return {
        reviewId: review._id.toString(),
        reviewerId: reviewer._id.toString(),
        username: reviewer.username,
        avatarPath: `${req.protocol}://${req.get('host')}/${reviewer.avatarPath}`,
        comment,
        date: review.dateCreated,
      };
    });

    res.status(HTTP_Status.OK).json({
      message: 'OK',
      reviews: response,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / query.pageSize)),
      page: query.page,
    });
  }
}
