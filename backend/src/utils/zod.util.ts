import type * as zod from 'zod';
import { AppError } from '../errors/errors.js';
import { HTTP_Status } from '../enums/httpStatus.enum.js';

export function zodErrorMessages(error: zod.ZodError): string {
  let message: string = '';
  for (const issue of error.issues) {
    message += `${issue.message} `;
  }
  return message.trim();
}

export function zodParseData<T>(schema: zod.ZodType<T>, data: unknown): T {
  const parsedData: zod.ZodSafeParseResult<T> = schema.safeParse(data);

  if (!parsedData.success) {
    throw new AppError(zodErrorMessages(parsedData.error), HTTP_Status.BAD_REQUEST);
  }

  return parsedData.data;
}
