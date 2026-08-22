import * as zod from 'zod';

import { Rank, Region, Role } from '../enums/account.enum.js';

const ZodErrorMessages = {
  rolesRequired: 'Role is required.',
  rolesMax: 'You can select at most 2 roles.',
  invalidRank: 'Invalid rank.',
  invalidRegion: 'Invalid region.',
  invalidDate: 'Invalid date.',
} as const;

function emptyToUndefined(value: unknown): unknown {
  return typeof value === 'string' && value.trim() === '' ? undefined : value;
}

function csvToArray(value: unknown): string[] | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export const createMatchMeValidator = zod.object({
  roles: zod.array(zod.enum(Role)).min(1, ZodErrorMessages.rolesRequired).max(2, ZodErrorMessages.rolesMax),
  description: zod.string().default(''),
});

export type CreateMatchMeData = zod.infer<typeof createMatchMeValidator>;

export const updateMatchMeValidator = zod.object({
  roles: zod.array(zod.enum(Role)).min(1, ZodErrorMessages.rolesRequired).max(2, ZodErrorMessages.rolesMax).optional(),
  description: zod.string().optional(),
});

export type UpdateMatchMeBody = zod.infer<typeof updateMatchMeValidator>;

export const listMatchMeValidator = zod.object({
  ranks: zod.preprocess(csvToArray, zod.array(zod.enum(Rank, ZodErrorMessages.invalidRank)).optional()),
  roles: zod.preprocess(csvToArray, zod.array(zod.enum(Role)).optional()),
  regions: zod.preprocess(csvToArray, zod.array(zod.enum(Region, ZodErrorMessages.invalidRegion)).optional()),
  search: zod.string().trim().optional(),
  username: zod.string().trim().optional(),
  account: zod.string().trim().optional(),
  dateFrom: zod.preprocess(emptyToUndefined, zod.coerce.date(ZodErrorMessages.invalidDate).optional()),
  dateTo: zod.preprocess(emptyToUndefined, zod.coerce.date(ZodErrorMessages.invalidDate).optional()),
  page: zod.coerce.number().int().min(1).default(1),
  pageSize: zod.coerce.number().int().min(1).max(50).default(5),
});

export type ListMatchMeQuery = zod.infer<typeof listMatchMeValidator>;
