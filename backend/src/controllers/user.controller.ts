import type { Request, Response } from 'express';
import * as zod from 'zod';
import type { IUserInfo } from '../models/userInfo.model.js';
import type { IUserProfile } from '../models/userProfile.model.js';
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
			res.status(HTTP_Status.OK).json({ message: 'OK.', ...userId });
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
	 * Fetches UserProfile by user Id.
	 *
	 * @param req - Express request; expects `req.params.userId` to be a valid MongoDB ObjectId
	 * @param res - Express response
	 * @returns 200 `IUserProfile` — the user's profile data
	 * @returns 400 if `req.params.userId` is missing
	 * @returns 404 if no user exists with the given Id
	 * @returns 500 if the linked UserProfile is missing or an unexpected error occurs
	 */
	async getUserProfile(req: Request, res: Response): Promise<void> {
		try {
			if (!req.params.userId) {
				throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
			}

			const userProfile: IUserProfile = await this.userService.getUserProfile(req.params.userId);
			res.status(HTTP_Status.OK).json(userProfile);
		} catch (err) {
			if (err instanceof AppError) {
				res.status(err.status).json({ message: err.message });
			} else {
				console.error('getUserProfile(req, res) Error: ', err);
				res.status(HTTP_Status.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
			}
		}
	}

	/**
	 * Updates profile fields for the given user ID.
	 *
	 * @param req - Express request; expects `req.params.userId` and `req.body.profile` with fields to update
	 * @param res - Express response
	 * @returns 200 if profile is updated successfully
	 * @returns 400 if `req.params.userId` is missing
	 * @returns 404 if no user exists with the given ID
	 * @returns 500 if there is a server error
	 */
	async updateUserProfile(req: Request, res: Response): Promise<void> {
		try {
			if (!req.params.userId) {
				throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
			}

			await this.userService.updateUserProfile(req.params.userId, req.body.profile);
			res.status(HTTP_Status.OK).json({ message: 'User profile updated successfully.' });
		} catch (err) {
			if (err instanceof AppError) {
				res.status(err.status).json({ message: err.message });
			} else {
				console.error('updateUserProfile(req, res) Error: ', err);
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
	 * @returns 200 `{ userId, username }` if credentials are valid
	 * @returns 400 if email or password is missing
	 * @returns 401 if credentials are invalid
	 * @returns 500 if there is a server error
	 */
	async login(req: Request, res: Response): Promise<void> {
		try {
			if (!req.body.email || !req.body.password) {
				throw new AppError('Email and password are required.', HTTP_Status.BAD_REQUEST);
			}

			const result: { userId: string; username: string } = await this.userService.authUser(
				req.body.email,
				req.body.password,
			);
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
	 * @returns 201 `{ userId, username }` if user is created successfully
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

			const result: { userId: string; username: string } = await this.userService.createUser(
				req.body.username,
				req.body.email,
				req.body.password,
			);
			res.status(HTTP_Status.CREATED).json({ userId: result.userId, username: result.username });
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
	 * @param req - Express request; expects `req.file` and `req.params.userId`
	 * @param res - Express response
	 * @returns 200 if avatar is updated successfully
	 * @returns 400 if no file is uploaded or user Id is missing
	 * @returns 404 if no user exists with the given Id
	 * @returns 500 if there is a server error
	 */
	async updateUserAvatar(req: Request, res: Response): Promise<void> {
		try {
			if (!req.file) {
				throw new AppError('No file uploaded.', HTTP_Status.BAD_REQUEST);
			}

			if (!req.params.userId) {
				throw new AppError('User ID is required.', HTTP_Status.BAD_REQUEST);
			}

			await this.userService.updateUserInfo(req.params.userId, { avatarPath: req.file.path });
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

	/**
	 * Fetches all data needed to render a user's dashboard by username.
	 *
	 * @param req - Express request; expects `req.params.username` to be a valid username
	 * @param res - Express response
	 * @returns 200 `{ userInfo, userProfile }` — user info and profile fetched in parallel
	 * @returns 400 if `req.params.username` is missing
	 * @returns 404 if no user exists with the given username
	 * @returns 500 if an unexpected error occurs
	 */
	async getUserDashboard(req: Request, res: Response): Promise<void> {
		try {
			if (!req.params.username) {
				throw new AppError('Username is required.', HTTP_Status.BAD_REQUEST);
			}

			const { userId }: { userId: string } = await this.userService.getUserId(req.params.username);
			if (!userId) {
				throw new AppError('User not found.', HTTP_Status.NOT_FOUND);
			}

			const [userInfo, userProfile]: [IUserInfo, IUserProfile] = await Promise.all([
				this.userService.getUserInfo(userId),
				this.userService.getUserProfile(userId),
			]);

			if (!userInfo || !userProfile) {
				throw new AppError('User info or profile not found.', HTTP_Status.NOT_FOUND);
			}

			userInfo.avatarPath = `${req.protocol}://${req.get('host')}/${userInfo.avatarPath.replace(/^\//, '')}`;
			res.status(HTTP_Status.OK).json({
				message: 'Dashboard data fetched successfully.',
				userId,
				userInfo,
				userProfile,
			});
		} catch (err) {
			if (err instanceof AppError) {
				res.status(err.status).json({ message: err.message });
			} else {
				console.error('getUserDashboard(req, res) Error: ', err);
				res.status(HTTP_Status.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
			}
		}
	}
}
