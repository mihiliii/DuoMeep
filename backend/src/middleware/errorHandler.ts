import type { NextFunction, Request, Response } from 'express';

import { HTTP_Status } from '../utils/enums/httpStatus.enum.js';
import { AppError } from '../utils/errors/errors.js';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  console.error(err);
  res.status(HTTP_Status.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
}
