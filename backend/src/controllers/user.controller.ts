import type { Request, Response } from 'express';
import * as zod from 'zod';
import type { IUserInfo } from '../models/userInfo.model.js';
import { AppError } from '../utils/errors.js';
import { HTTP_Status } from '../utils/constants.js';
import { UserService } from '../services/user.service.js';

export class UserController {
	private userService = new UserService();

	/**
	 * Fetches a user's Id by username.
	 *
	 * @param req - Express request; expects `req.params.username` to be a valid username
	 * @param res - Express response
	 * @returns 200 `{ userId }` — the user's Id
	 * @returns 404 if no user exists with the given username
	 * @returns 500 if an unexpected error occurs
	 */
	async getUserId(req: Request, res: Response): Promise<void> {
		try {
			if (!req.params.username) {
				throw new AppError('Username parameter is required.', HTTP_Status.BAD_REQUEST);
			}

			const userId: { userId: string } = await this.userService.getUserId(req.params.username);
			res.status(HTTP_Status.OK).json(userId);
		} catch (err) {
			if (err instanceof AppError) {
				res.status(err.status).json({ message: err.message });
			} else {
				console.error('getUserIdByUsername(req, res) Error: ', err);
				res.status(HTTP_Status.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
			}
		}
	}

	/**
	 * Fetches UserInfo by user Id.
	 *
	 * @param req - Express request; expects `req.params.userId` to be a valid MongoDB ObjectId
	 * @param res - Express response
	 * @returns 200 `IUserInfo` — user info with resolved `avatarPath` URL
	 * @returns 400 if `req.params.userId` is missing
	 * @returns 404 if no user exists with the given ID
	 * @returns 500 if the linked UserInfo is missing or an unexpected error occurs
	 */
	async getUserInfo(req: Request, res: Response): Promise<void> {
		try {
			if (!req.params.userId) {
				throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
			}

			const userInfo: IUserInfo = await this.userService.getUserInfo(req.params.userId);
			userInfo.avatarPath = `${req.protocol}://${req.get('host')}/${userInfo.avatarPath.replace(/^\//, '')}`;
			res.status(HTTP_Status.OK).json(userInfo);
		} catch (err) {
			if (err instanceof AppError) {
				res.status(err.status).json({ message: err.message });
			} else {
				console.error('getUserInfoByUserId(req, res) Error: ', err);
				res.status(HTTP_Status.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
			}
		}
	}

	/**
	 * Updates user information by user Id.
	 *
	 * @param req - Express request; expects `req.params.userId` and `req.body.dashboard` with fields to update
	 * @param res - Express response
	 * @returns 200 if user info is updated successfully
	 * @returns 400 if `req.params.userId` is missing
	 * @returns 404 if no user exists with the given Id
	 * @returns 500 if there is a server error
	 */
	async updateUserInfo(req: Request, res: Response): Promise<void> {
		try {
			if (!req.params.userId) {
				throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
			}

			await this.userService.updateUserInfo(req.params.userId, req.body.dashboard);
			res.status(HTTP_Status.OK).json({ message: 'User info updated successfully.' });
		} catch (err) {
			if (err instanceof AppError) {
				res.status(err.status).json({ message: err.message });
			} else {
				console.error('updateUserInfo(req, res) Error: ', err);
				res.status(HTTP_Status.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
			}
		}
	}

	/**
	 * Authenticates a user by email and password.
	 *
	 * @param req - Express request; expects `req.body` to contain `email` and `password`
	 * @param res - Express response
	 * @returns 200 `{ userId }` if credentials are valid
	 * @returns 400 if email or password is missing
	 * @returns 401 if credentials are invalid
	 * @returns 500 if there is a server error
	 */
	async login(req: Request, res: Response): Promise<void> {
		try {
			if (!req.body.email || !req.body.password) {
				throw new AppError('Email and password are required.', HTTP_Status.BAD_REQUEST);
			}

			const result: { userId: string } = await this.userService.login(req.body.email, req.body.password);
			res.status(HTTP_Status.OK).json({ message: 'Login success.', ...result });
		} catch (err) {
			if (err instanceof AppError) {
				res.status(err.status).json({ message: err.message });
			} else {
				console.error('login(req, res) Error: ', err);
				res.status(HTTP_Status.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
			}
		}
	}

	/**
	 * Registers a new user with unique username and email.
	 *
	 * Validates the request body with Zod before proceeding:
	 * username (max 24 chars), valid email, password (min 8 chars, 1 uppercase, 1 number).
	 *
	 * @param req - Express request; expects `req.body` to contain `username`, `email`, and `password`
	 * @param res - Express response
	 * @returns 201 `{ userId }` if user is created successfully
	 * @returns 400 if validation fails
	 * @returns 409 if username or email already exists
	 * @returns 500 if there is a server error
	 */
	async register(req: Request, res: Response): Promise<void> {
		try {
			const passwordRegex: RegExp = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

			const registerInput = zod.object({
				username: zod
					.string()
					.min(1, 'Username is required.')
					.max(24, 'Username must be at most 24 characters long.'),
				email: zod.email('Invalid email address.'),
				password: zod
					.string()
					.regex(
						passwordRegex,
						'Password must be at least 8 characters long, contain at least one uppercase letter and one number.',
					),
			});

			const parsed = registerInput.safeParse(req.body);
			if (!parsed.success) {
				throw new AppError(parsed.error.issues[0]?.message || 'Validation failed.', HTTP_Status.BAD_REQUEST);
			}

			const result: { userId: string } = await this.userService.register(
				req.body.username,
				req.body.email,
				req.body.password,
			);
			res.status(HTTP_Status.CREATED).json({ userId: result.userId });
		} catch (err) {
			if (err instanceof AppError) {
				res.status(err.status).json({ message: err.message });
			} else {
				console.error('register(req, res) Error: ', err);
				res.status(HTTP_Status.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
			}
		}
	}

	/**
	 * Updates the avatar for a user.
	 *
	 * @param req - Express request; expects `req.file` and `req.body.username`
	 * @param res - Express response
	 * @returns 200 if avatar is updated successfully
	 * @returns 400 if no file is uploaded or username is missing
	 * @returns 404 if no user exists with the given username
	 * @returns 500 if there is a server error
	 */
	async updateUserAvatar(req: Request, res: Response): Promise<void> {
		try {
			if (!req.file) {
				throw new AppError('No file uploaded.', HTTP_Status.BAD_REQUEST);
			}

			if (!req.body.username) {
				throw new AppError('Username is required.', HTTP_Status.BAD_REQUEST);
			}

			await this.userService.updateUserInfo(req.body.username, { avatarPath: req.file.path });
			res.status(HTTP_Status.OK).json({ message: 'Avatar updated successfully.' });
		} catch (err) {
			if (err instanceof AppError) {
				res.status(err.status).json({ message: err.message });
			} else {
				console.error('updateUserAvatar(req, res) Error: ', err);
				res.status(HTTP_Status.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
			}
		}
	}
}
