import * as zod from 'zod';

export const createChatValidator = zod.object({
  message: zod.string().trim().min(1).max(2000),
});

export type CreateChatData = zod.infer<typeof createChatValidator>;

export const listThreadValidator = zod.object({
  page: zod.coerce.number().int().min(1).default(1),
  pageSize: zod.coerce.number().int().min(1).max(100).default(30),
});

export type ListThreadQuery = zod.infer<typeof listThreadValidator>;
