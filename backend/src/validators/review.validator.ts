import * as zod from 'zod';

export const createReviewValidator = zod.object({
  comment: zod.string().trim().min(1).max(2000),
  isLike: zod.boolean(),
});

export type CreateReviewData = zod.infer<typeof createReviewValidator>;

export const updateReviewValidator = zod.object({
  comment: zod.string().trim().min(1).max(2000).optional(),
  isLike: zod.boolean().optional(),
});

export type UpdateReviewData = zod.infer<typeof updateReviewValidator>;

export const listReviewValidator = zod.object({
  page: zod.coerce.number().int().min(1).default(1),
  pageSize: zod.coerce.number().int().min(1).max(50).default(5),
});

export type ListReviewQuery = zod.infer<typeof listReviewValidator>;
