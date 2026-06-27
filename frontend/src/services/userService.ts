import axios from 'axios';
import API_URL from '../config/api';
import type { IUserInfo, IUserProfile, Gender } from '../types/user';

export interface AuthResponse {
	message: string;
	userId: string;
	username: string;
}

export interface DashboardResponse {
	message: string;
	userId: string;
	userInfo: IUserInfo;
	userProfile: IUserProfile;
}

export interface UserInfoResponse {
	message: string;
	displayName: string;
	avatarPath: string;
	birthDate: Date | null;
	gender: Gender | null;
}

/**
 * Registers a new user with the given credentials.
 *
 * @param username - The user's username
 * @param email - The user's email address
 * @param password - The user's password (min 8 chars, 1 uppercase, 1 number)
 * @returns `AuthResponse` containing `userId` and `username`
 * @throws if the username or email already exists, or validation fails
 */
export async function registerUser(username: string, email: string, password: string): Promise<AuthResponse> {
	try {
		const response = await axios.post<AuthResponse>(`${API_URL}/users/register`, { username, email, password });
		return response.data;
	} catch (err) {
		throw axios.isAxiosError(err) ? new Error(err.response?.data?.message) : err;
	}
}

/**
 * Authenticates a user by email and password.
 *
 * @param email - The user's email address
 * @param password - The user's password
 * @returns `AuthResponse` containing `userId` and `username`
 * @throws if the credentials are invalid
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
	try {
		const response = await axios.post<AuthResponse>(`${API_URL}/users/login`, { email, password });
		return response.data;
	} catch (err) {
		throw axios.isAxiosError(err) ? new Error(err.response?.data?.message) : err;
	}
}

/**
 * Fetches UserInfo and UserProfile by user ID.
 *
 * @param userId - The user's ID
 * @returns `UserInfoResponse` containing `userInfo`
 * @throws if no user exists with the given ID
 */
export async function getUserInfo(userId: string): Promise<UserInfoResponse> {
	try {
		const response = await axios.get<UserInfoResponse>(`${API_URL}/users/${userId}/info`);
		return response.data;
	} catch (err) {
		throw axios.isAxiosError(err) ? new Error(err.response?.data?.message) : err;
	}
}

/**
 * Updates UserInfo fields for the given user ID.
 *
 * @param userId - The user's ID
 * @param userInfo - Partial `IUserInfo` fields to update
 * @throws if no user exists with the given ID
 */
export async function updateUserInfo(userId: string, userInfo: Partial<IUserInfo>): Promise<void> {
	try {
		await axios.put(`${API_URL}/users/${userId}/info`, userInfo);
	} catch (err) {
		throw axios.isAxiosError(err) ? new Error(err.response?.data?.message) : err;
	}
}

/**
 * Fetches UserProfile by user ID.
 *
 * @param userId - The user's ID
 * @returns `IUserProfile` containing profile data
 * @throws if no user exists with the given ID
 */
export async function getUserProfile(userId: string): Promise<IUserProfile> {
	try {
		const response = await axios.get<IUserProfile>(`${API_URL}/users/${userId}/profile`);
		return response.data;
	} catch (err) {
		throw axios.isAxiosError(err) ? new Error(err.response?.data?.message) : err;
	}
}

/**
 * Updates profile fields for the given user ID.
 *
 * @param userId - The user's ID
 * @param data - Partial `IUserInfo` fields to update
 * @throws if no user exists with the given ID
 */
export async function updateUserProfile(userId: string, data: Partial<IUserInfo>): Promise<void> {
	try {
		await axios.put(`${API_URL}/users/${userId}/profile`, { profile: data });
	} catch (err) {
		throw axios.isAxiosError(err) ? new Error(err.response?.data?.message) : err;
	}
}

/**
 * Uploads a new avatar image for the given user ID.
 *
 * @param userId - The user's ID
 * @param file - The image file to upload
 * @throws if no user exists with the given ID or the file is invalid
 */
export async function updateAvatar(userId: string, file: File): Promise<void> {
	try {
		const formData: FormData = new FormData();
		formData.append('profileImage', file);
		await axios.put(`${API_URL}/users/${userId}/avatar`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
	} catch (err) {
		throw axios.isAxiosError(err) ? new Error(err.response?.data?.message) : err;
	}
}

/**
 * Fetches full dashboard data (UserInfo + UserProfile) by username.
 *
 * @param username - The user's username
 * @returns `DashboardResponse` containing `userId`, `userInfo` and `userProfile`
 * @throws if no user exists with the given username
 */
export async function getDashboard(username: string): Promise<DashboardResponse> {
	try {
		const response = await axios.get<DashboardResponse>(`${API_URL}/users/username/${username}/dashboard`);
		return response.data;
	} catch (err) {
		throw axios.isAxiosError(err) ? new Error(err.response?.data?.message) : err;
	}
}
