import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import { userType, User, type IUser } from '../models/user.model.js';
import argon2 from 'argon2';

export class UserController {
	getCreationDate(_id: Types.ObjectId): Date {
		return new Date(parseInt(_id.toString().substring(0, 8), 16) * 1000);
	}

	/**
	 * Authenticates a user by username and password.
	 *
	 * @param req - Express request containing username and password in body
	 * @param res - Express response
	 * @returns 200 with user object if credentials are valid
	 * @returns 401 if credentials are invalid
	 *
	 * @example
	 * POST /login
	 * Body: { username: "john", password: "secret123" }
	 */
	async login(req: Request, res: Response): Promise<void> {
		try {
			const user: IUser | null = await User.findOne({
				username: req.body.username,
			});

			if (user && (await argon2.verify(user.password, req.body.password))) {
				res.status(200).json({ message: 'Login successful', user: user });
			} else {
				res.status(401).json({ message: 'Invalid credentials' });
			}
		} catch (err) {
			console.log('Login error: ', err);
			res.status(500).json({ message: 'Login error', error: err });
		}
	}

	/**
	 * Registers a new user with unique username and email.
	 *
	 * @param req - Express request containing username, password and email in body
	 * @param res - Express response
	 * @returns 201 if user is created successfully
	 * @returns 409 if username or email already exists
	 *
	 * @example
	 * POST /register
	 * Body: { username: "john", password: "secret123", email: "john@example.com" }
	 */
	async register(req: Request, res: Response): Promise<void> {
		const userFound: IUser | null = await User.findOne({
			$or: [{ username: req.body.username }, { email: req.body.email }],
		});

		if (userFound == null) {
			try {
				const hashedPassword = await argon2.hash(req.body.password);
				await User.create({
					username: req.body.username,
					password: hashedPassword,
					email: req.body.email,
					userType: userType.STANDARD,
					userInfo: {
						birthDate: null,
						gender: null,
						details: '',
						games: [],
						socials: {},
						shownOnProfile: [],
					},
				});
				res.status(201).json({ message: 'User registered successfully' });
			} catch (err) {
				console.log('Registration error: ', err);
				res.status(500).json({ message: 'Registration error', error: err });
			}
		} else {
			let message = '';
			if (userFound.username == req.body.username) {
				message += 'Username already exists. ';
			}
			if (userFound.email == req.body.email) {
				message += 'Email already exists. ';
			}
			res.status(409).json({ message: message.trim() });
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
			res.status(400).json({ message: 'No file uploaded' });
		} else {
			await User.updateOne(
				{ username: req.body.username },
				{ profilePicture: req.file.path },
			);
			res.status(200).json({
				message: 'Profile picture uploaded successfully',
				file: req.file,
			});
		}
	}
}
