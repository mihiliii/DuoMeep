import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import argon2 from 'argon2';
import { UserType, User, type IUser } from '../models/user.model.js';
import { UserDashboard } from './../models/userDashboard.model.js';
import type { IUserDashboard } from '../models/userDashboard.model.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET: string = (process.env.JWT_SECRET as string) || 'DuoMeepSecretKey';

export class UserController {
	getCreationDate(_id: Types.ObjectId): Date {
		return new Date(parseInt(_id.toString().substring(0, 8), 16) * 1000);
	}

	/**
	 * Fetches user information by user ID.
	 *
	 * @param req - Express request containing user ID in params
	 * @param res - Express response
	 * @returns 200 with user info if user is found
	 * @returns 404 if user is not found
	 * @returns 500 if there is a server error
	 */
	async getUserInfo(req: Request, res: Response): Promise<void> {
		try {
			const user: IUser | null = await User.findById(req.params.id);

			if (!user) {
				res.status(404).json({ message: 'User not found.' });
				return;
			}

			const userDashboard: IUserDashboard | null = await UserDashboard.findById(user.userDashboardId);

			if (!userDashboard) {
				console.error('User dashboard not found for user ID: ', req.params.id);
				res.status(500).json({ message: 'Internal server error, please try again.' });
				return;
			}

			userDashboard.profilePicture = `${req.protocol}://${req.get('host')}/${userDashboard.profilePicture}`;

			interface IResponse {
				username: string;
				email: string;
				dashboard: IUserDashboard;
			}

			const response: IResponse = {
				username: user.username,
				email: user.email,
				dashboard: userDashboard,
			};

			res.status(200).json(response);
		} catch (err) {
			console.error('Error fetching user info: ', err);
			res.status(500).json({ message: 'Internal server error, please try again.' });
		}
	}

	/**
	 *
	 * Updates user information by user ID.
	 *
	 * @param req - Express request containing user ID in params and updated info in body
	 * @param res - Express response
	 * @returns 200 if user info is updated successfully
	 * @returns 404 if user or user dashboard is not found
	 * @returns 500 if there is a server error
	 *
	 * @example
	 * PUT /user/12345
	 * Body: { bio: "New bio", tagline: "New tagline" }
	 */
	async updateUserInfo(req: Request, res: Response): Promise<void> {
		try {
			const user: IUser | null = await User.findById(req.params.id);

			if (!user) {
				res.status(404).json({ message: 'User not found.' });
				return;
			}

			const userDashboard: IUserDashboard | null = await UserDashboard.findById(user.userDashboardId);

			if (!userDashboard) {
				console.error('User dashboard not found for user ID: ', req.params.id);
				res.status(500).json({ message: 'Internal server error, please try again.' });
				return;
			}

			await UserDashboard.updateOne({ _id: user.userDashboardId }, req.body.dashboard);
			res.status(200).json({ message: 'User info updated successfully.' });
		} catch (err) {
			console.error('Error updating user info: ', err);
			res.status(500).json({ message: 'Internal server error, please try again.' });
		}
	}

	/**
	 * Authenticates a user by email and password.
	 *
	 * @param req - Express request containing email and password in body
	 * @param res - Express response
	 * @returns 200 with user object if credentials are valid
	 * @returns 401 if credentials are invalid
	 * @returns 500 if there is a server error
	 *
	 * @example
	 * POST /login
	 * Body: { email: "john@example.com", password: "secret123" }
	 */
	async login(req: Request, res: Response): Promise<void> {
		try {
			const user: IUser | null = await User.findOne({ email: req.body.email });

			if (!user || !(await argon2.verify(user.password, req.body.password))) {
				res.status(401).json({ message: 'Invalid credentials.' });
				return;
			}

			const token: string = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
				expiresIn: '1h',
			});

			res.status(200).json({
				message: 'Login success.',
				userId: user._id,
				token: token,
			});
		} catch (err) {
			console.error('Login error: ', err);
			res.status(500).json({ message: 'Internal server error, please try again.' });
		}
	}

	/**
	 * Registers a new user with unique username and email.
	 *
	 * @param req - Express request containing username, password and email in body
	 * @param res - Express response
	 * @returns 200 if user is created successfully
	 * @returns 409 if username or email already exists
	 * @returns 500 if there is a server error
	 *
	 * @example
	 * POST /register
	 * Body: { username: "john", password: "secret123", email: "john@example.com" }
	 */
	async register(req: Request, res: Response): Promise<void> {
		try {
			const userFound: IUser | null = await User.findOne({
				$or: [{ username: req.body.username }, { email: req.body.email }],
			});

			if (!userFound) {
				const hashedPassword: string = await argon2.hash(req.body.password);
				if (!hashedPassword) {
					throw new Error('Failed to hash password');
				}

				const userDashboard: IUserDashboard = await UserDashboard.create({});
				if (!userDashboard) {
					throw new Error('Failed to create user dashboard');
				}

				const user: IUser = await User.create({
					username: req.body.username,
					password: hashedPassword,
					email: req.body.email,
					userType: UserType.STANDARD,
					userDashboardId: userDashboard._id,
				});

				res.status(200).json({
					message: 'Register success.',
					userId: user._id,
				});
			} else {
				let message: string = '';

				if (userFound.username == req.body.username) {
					message += 'Username already exists. ';
				}
				if (userFound.email == req.body.email) {
					message += 'Email already exists. ';
				}
				res.status(409).json({ message: message.trim() });
			}
		} catch (err) {
			console.error('Registration error: ', err);
			res.status(500).json({ message: 'Internal server error, please try again.' });
		}
	}

	/**
	 * Uploads a profile picture for a user.
	 * @param req - Express request containing the profile picture file and username in body
	 * @param res - Express response
	 * @returns 200 if profile picture is uploaded successfully
	 * @returns 400 if no file is uploaded
	 */
	async uploadProfilePicture(req: Request, res: Response): Promise<void> {
		if (!req.file) {
			res.status(400).json({ message: 'No file uploaded.' });
			return;
		}

		try {
			await User.updateOne({ username: req.body.username }, { profilePicture: req.file.path });
			res.status(200).json({ message: 'Profile picture uploaded successfully.' });
		} catch (err) {
			console.error('Profile picture upload error: ', err);
			res.status(500).json({ message: 'Internal server error, please try again.' });
		}
	}
}
