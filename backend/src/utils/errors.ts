import { HTTP_Status } from './constants.js';

export class AppError extends Error {
	public status: number;

	constructor(message: string, status: number) {
		super(message);
		this.status = status;
	}
}

export class ServerError extends Error {
	public status: number;

	constructor(message: string, status: number = HTTP_Status.INTERNAL_SERVER_ERROR) {
		super(message);
		this.status = status;
	}
}

export class NotFoundError extends AppError {
	constructor(message: string = 'Not found') {
		super(message, HTTP_Status.NOT_FOUND);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message: string = 'Unauthorized') {
		super(message, HTTP_Status.UNAUTHORIZED);
	}
}

export class ConflictError extends AppError {
	constructor(message: string = 'Conflict') {
		super(message, HTTP_Status.CONFLICT);
	}
}

export class InternalServerError extends AppError {
	constructor(message: string = 'Internal Server Error') {
		super(message, HTTP_Status.INTERNAL_SERVER_ERROR);
	}
}
