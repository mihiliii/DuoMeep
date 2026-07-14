import axios from 'axios';
import API_URL from '../config/api';
import type { UserInfo, UserDashboard } from '../types/user';

export type AuthResponse = {
  message: string;
  userId: string;
};

export type UserInfoResponse = {
  message: string;
  username: string;
  avatarPath: string;
};

export type UserDashboardResponse = {
  message: string;
  bio: string;
  tagline: string;
  banner: string;
};

export type UserData = {
  userId: string;
  userInfo: UserInfo;
  dashboard: UserDashboard;
};

export type UpdateUserData = {
  username?: string;
  dashboard?: Partial<UserDashboard>;
  authInfo?: { email?: string; password?: string };
};

class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 0) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

function resolveApiError(err: unknown): never {
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

/**
 * Registers a new user with the given credentials.
 *
 * @param username - The user's username
 * @param email - The user's email address
 * @param password - The user's password (min 8 chars, 1 uppercase, 1 number)
 * @returns `AuthResponse` containing `userId`
 * @throws if the username or email already exists, or validation fails
 */
export async function registerUser(username: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/users/register`, { username, email, password });
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

/**
 * Authenticates a user by email and password.
 *
 * @param email - The user's email address
 * @param password - The user's password
 * @returns `AuthResponse` containing `userId`
 * @throws if the credentials are invalid
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/users/login`, { email, password });
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

/**
 * Fetches the username and avatar path for the given user ID.
 *
 * @param userId - The user's ID
 * @returns `UserInfoResponse` containing `username` and `avatarPath`
 * @throws if no user exists with the given ID
 */
export async function getUserInfo(userId: string): Promise<UserInfoResponse> {
  try {
    const response = await axios.get<UserInfoResponse>(`${API_URL}/users/${userId}/info`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

/**
 * Updates the given user (username, dashboard and/or auth info).
 *
 * @param userId - The user's ID
 * @param data - Partial `UpdateUserData` fields to update
 * @throws if no user exists with the given ID
 */
export async function updateUser(userId: string, data: UpdateUserData): Promise<void> {
  try {
    await axios.put(`${API_URL}/users/${userId}`, data);
  } catch (err) {
    resolveApiError(err);
  }
}

/**
 * Fetches the dashboard (bio, tagline, banner) for the given user ID.
 *
 * @param userId - The user's ID
 * @returns `UserDashboardResponse` containing `bio`, `tagline` and `banner`
 * @throws if no user exists with the given ID
 */
export async function getUserDashboard(userId: string): Promise<UserDashboardResponse> {
  try {
    const response = await axios.get<UserDashboardResponse>(`${API_URL}/users/${userId}/dashboard`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
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
    formData.append('userAvatar', file);
    await axios.put(`${API_URL}/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (err) {
    resolveApiError(err);
  }
}

/**
 * Fetches combined dashboard data (user info + dashboard) for the given user ID.
 *
 * @param userId - The user's ID
 * @returns `UserDashboardData` containing `userId`, `userInfo` and `dashboard`
 * @throws if no user exists with the given ID
 */
export async function getDashboard(userId: string): Promise<UserData> {
  const [info, profile] = await Promise.all([getUserInfo(userId), getUserDashboard(userId)]);

  return {
    userId,
    userInfo: { username: info.username, avatarPath: info.avatarPath },
    dashboard: { bio: profile.bio, tagline: profile.tagline, banner: profile.banner },
  };
}
