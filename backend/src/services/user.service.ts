import argon2 from 'argon2';
import { AppError } from '../utils/errors.js';
import { HTTP_Status } from '../utils/constants.js';
import { User, type IUser } from '../models/user.model.js';
import { UserInfo, type IUserInfo } from '../models/userInfo.model.js';
import { UserProfile, type IUserProfile } from '../models/userProfile.model.js';

export class UserService {
	async getUserId(username: string): Promise<{ userId: string }> {
		const user: IUser | null = await User.findOne({ username });

		if (!user) {
			throw new AppError('User with username (' + username + ') not found.', HTTP_Status.NOT_FOUND);
		}

		return { userId: user._id.toString() };
	}

	async getUserInfo(userId: string): Promise<IUserInfo> {
		const user: IUser | null = await User.findById(userId);

		if (!user) {
			throw new AppError('User with id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
		}

		const userInfo: IUserInfo | null = await UserInfo.findById(user.userInfoId);

		if (!userInfo) {
			throw new AppError('UserInfo for user with id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
		}

		return userInfo;
	}

	async getUserProfile(userId: string): Promise<IUserProfile> {
		const user: IUser | null = await User.findById(userId);

		if (!user) {
			throw new AppError('User with id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
		}

		const userProfile: IUserProfile | null = await UserProfile.findById(user.userProfileId);

		if (!userProfile) {
			throw new AppError('UserProfile for user with id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
		}

		return userProfile;
	}

	async updateUserInfo(userId: string, data: Partial<IUserInfo>): Promise<void> {
		const user: IUser | null = await User.findById(userId);

		if (!user) {
			throw new AppError('User with id (' + userId + ') not found.', HTTP_Status.NOT_FOUND);
		}

		if ((await UserInfo.updateOne({ _id: user.userInfoId }, data)).matchedCount === 0) {
			throw new AppError(
				'UserInfo for user with id (' + userId + ') not found.',
				HTTP_Status.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async authUser(email: string, password: string): Promise<{ userId: string; username: string }> {
		const user: IUser | null = await User.findOne({ email });

		if (!user || !(await argon2.verify(user.password, password))) {
			throw new AppError('Invalid credentials.', HTTP_Status.UNAUTHORIZED);
		}

		return { userId: user._id.toString(), username: user.username };
	}

	async createUser(username: string, email: string, password: string): Promise<{ userId: string; username: string }> {
		const existingUser: IUser | null = await User.findOne({
			$or: [{ username }, { email }],
		});

		if (existingUser) {
			let message: string = '';
			if (existingUser.username === username) {
				message += 'Username already exists. ';
			}
			if (existingUser.email === email) {
				message += 'Email already exists. ';
			}
			throw new AppError(message.trim(), HTTP_Status.CONFLICT);
		}

		const hashedPassword: string = await argon2.hash(password);

		const userInfo: IUserInfo = await UserInfo.create({ displayName: username });
		const userProfile: IUserProfile = await UserProfile.create({});

		const user: IUser = await User.create({
			username,
			email,
			password: hashedPassword,
			userInfoId: userInfo._id,
			userProfileId: userProfile._id,
		});

		return { userId: user._id.toString(), username: user.username };
	}
}
