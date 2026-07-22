import axios from 'axios';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 0) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export function resolveApiError(err: unknown): never {
  if (!axios.isAxiosError(err)) {
    throw err;
  }

  if (err.response) {
    throw new ApiError(err.response.data?.message || 'Api response error.', err.response.status);
  }

  if (err.request) {
    throw new ApiError('No response received from the server.');
  }

  throw new ApiError('An unknown error occurred.');
}
