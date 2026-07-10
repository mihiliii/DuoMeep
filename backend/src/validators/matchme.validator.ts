import * as zod from 'zod';
import { Role } from '../enums/account.enum.js';

const ZodErrorMessages = {
  rolesRequired: 'Role is required.',
  rolesMax: 'You can select at most 2 roles.',
} as const;

export const createMatchMeValidator = zod.object({
  roles: zod.array(zod.enum(Role)).min(1, ZodErrorMessages.rolesRequired).max(2, ZodErrorMessages.rolesMax),
  description: zod.string().default(''),
  requirements: zod.record(zod.string(), zod.any()).default({}),
});

export type CreateMatchMeData = zod.infer<typeof createMatchMeValidator>;

export const updateMatchMeValidator = zod.object({
  roles: zod.array(zod.enum(Role)).min(1, ZodErrorMessages.rolesRequired).max(2, ZodErrorMessages.rolesMax).optional(),
  description: zod.string().optional(),
  requirements: zod.record(zod.string(), zod.any()).optional(),
});

export type UpdateMatchMeBody = zod.infer<typeof updateMatchMeValidator>;
