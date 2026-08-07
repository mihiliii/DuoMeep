import * as zod from 'zod';

const ZodErrorMessages = {
  credentialsRequired: 'Username and password are required.',
} as const;

export const authAdminValidator = zod.object({
  username: zod.string().min(1, ZodErrorMessages.credentialsRequired),
  password: zod.string().min(1, ZodErrorMessages.credentialsRequired),
});

export type AuthAdminData = zod.infer<typeof authAdminValidator>;
