import * as zod from 'zod';

const ZodErrorMessages = {
  invalidDate: 'Invalid date.',
} as const;

function emptyToUndefined(value: unknown): unknown {
  return typeof value === 'string' && value.trim() === '' ? undefined : value;
}

export const createReviewValidator = zod.object({
  comment: zod.string().trim().min(1).max(2000),
});

export type CreateReviewData = zod.infer<typeof createReviewValidator>;

export const listReviewValidator = zod.object({
  page: zod.coerce.number().int().min(1).default(1),
  pageSize: zod.coerce.number().int().min(1).max(50).default(5),
});

export type ListReviewQuery = zod.infer<typeof listReviewValidator>;

export const listAllReviewsValidator = listReviewValidator.extend({
  reviewer: zod.string().trim().optional(),
  target: zod.string().trim().optional(),
  comment: zod.string().trim().optional(),
  dateFrom: zod.preprocess(emptyToUndefined, zod.coerce.date(ZodErrorMessages.invalidDate).optional()),
  dateTo: zod.preprocess(emptyToUndefined, zod.coerce.date(ZodErrorMessages.invalidDate).optional()),
});

export type ListAllReviewsQuery = zod.infer<typeof listAllReviewsValidator>;
