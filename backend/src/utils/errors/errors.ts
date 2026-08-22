import { HTTP_Status } from '../enums/httpStatus.enum.js';

export class AppError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
