import type * as zod from 'zod';

import { HTTP_Status } from '../enums/httpStatus.enum.js';
import { AppError } from '../errors/errors.js';

export function zodParseData<T>(schema: zod.ZodType<T>, data: unknown): T {
  const parsedData: zod.ZodSafeParseResult<T> = schema.safeParse(data);

  if (!parsedData.success) {
    let message: string = '';
    for (const issue of parsedData.error.issues) {
      message += `${issue.message} `;
    }
    message = message.trim();
    throw new AppError(message, HTTP_Status.BAD_REQUEST);
  }

  return parsedData.data;
}
