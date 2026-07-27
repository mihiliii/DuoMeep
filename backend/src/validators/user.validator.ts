import * as zod from 'zod';

const passwordRegex: RegExp = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

const ZodErrorMessages = {
  usernameRequired: 'Username is required.',
  usernameMaxLength: 'Username must be at most 24 characters long.',
  taglineMaxLength: 'Tagline must be at most 40 characters long.',
  bioMaxLength: 'Bio must be at most 80 characters long.',
  invalidEmail: 'Invalid email address.',
  invalidPassword: 'Password must be at least 8 characters long, contain at least one uppercase letter and one number.',
  credentialsRequired: 'Email and password are required.',
} as const;

export const createUserValidator = zod.object({
  username: zod.string().min(1, ZodErrorMessages.usernameRequired).max(24, ZodErrorMessages.usernameMaxLength),
  email: zod.email(ZodErrorMessages.invalidEmail),
  password: zod.string().regex(passwordRegex, ZodErrorMessages.invalidPassword),
});

export type CreateUserData = zod.infer<typeof createUserValidator>;

export const authUserValidator = zod.object({
  email: zod.string().min(1, ZodErrorMessages.credentialsRequired),
  password: zod.string().min(1, ZodErrorMessages.credentialsRequired),
});

export type AuthUserData = zod.infer<typeof authUserValidator>;

export const updateUserValidator = zod.object({
  username: zod
    .string()
    .min(1, ZodErrorMessages.usernameRequired)
    .max(24, ZodErrorMessages.usernameMaxLength)
    .optional(),
  dashboard: zod
    .object({
      bio: zod.string().max(80, ZodErrorMessages.bioMaxLength).optional(),
      tagline: zod.string().max(40, ZodErrorMessages.taglineMaxLength).optional(),
      banner: zod.string().optional(),
    })
    .optional(),
  authInfo: zod
    .object({
      email: zod.email(ZodErrorMessages.invalidEmail).optional(),
      password: zod.string().regex(passwordRegex, ZodErrorMessages.invalidPassword).optional(),
    })
    .optional(),
});

export type UpdateUserData = zod.infer<typeof updateUserValidator>;
