import * as zod from 'zod';

export const createReviewValidator = zod.object({
  comment: zod.string().trim().min(1).max(2000),
});

export type CreateReviewData = zod.infer<typeof createReviewValidator>;

export const listReviewValidator = zod.object({
  page: zod.coerce.number().int().min(1).default(1),
  pageSize: zod.coerce.number().int().min(1).max(50).default(5),
});

export type ListReviewQuery = zod.infer<typeof listReviewValidator>;
