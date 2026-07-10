import * as zod from 'zod';
import { Rank, Region } from '../enums/account.enum.js';

const ZodErrorMessages = {
  nameRequired: 'Game account name is required.',
  invalidRegion: 'Invalid region.',
  invalidRank: 'Invalid rank.',
} as const;

export const createGameAccountValidator = zod.object({
  name: zod.string().min(1, ZodErrorMessages.nameRequired),
  region: zod.enum(Region, ZodErrorMessages.invalidRegion),
  rank: zod.enum(Rank, ZodErrorMessages.invalidRank).default(Rank.UNRANKED),
});

export type CreateGameAccountData = zod.infer<typeof createGameAccountValidator>;

export const updateGameAccountValidator = zod.object({
  name: zod.string().min(1, ZodErrorMessages.nameRequired).optional(),
  region: zod.enum(Region, ZodErrorMessages.invalidRegion).optional(),
  rank: zod.enum(Rank, ZodErrorMessages.invalidRank).optional(),
});

export type UpdateGameAccountData = zod.infer<typeof updateGameAccountValidator>;
