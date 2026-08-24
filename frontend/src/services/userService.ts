import axios from 'axios';

import API_URL from '@/config/api';

import { resolveApiError } from './apiError';

export type UserDashboard = {
  bio: string;
  tagline: string;
  banner: string;
}

export type UserInfo = {
  username: string;
  avatarPath: string;
}


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

export type UserEmailResponse = {
  message: string;
  email: string;
};

export type UserSearchResult = {
  userId: string;
  username: string;
  avatarPath: string;
  tagline: string;
  accountName: string;
  rank: string;
  region: string;
  dateCreated: string;
};

export type UserSearchResponse = {
  message: string;
  results: UserSearchResult[];
  totalCount: number;
  totalPages: number;
  page: number;
};

export type UserData = {
  userId: string;
  userInfo: UserInfo;
  dashboard: UserDashboard;
};

export type UpdateUserData = {
  username?: string;
  bio?: string;
  tagline?: string;
  banner?: string;
  authInfo?: { email?: string; password?: string };
};

export async function registerUser(username: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/users/register`, { username, email, password });
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/users/login`, { email, password });
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export async function getUserId(username: string): Promise<AuthResponse> {
  try {
    const response = await axios.get<AuthResponse>(`${API_URL}/users/username/${username}/id`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export type SearchUsersFilters = {
  username?: string;
  account?: string;
  ranks?: string[];
  regions?: string[];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
};

export async function searchUsers(filters: SearchUsersFilters = {}): Promise<UserSearchResponse> {
  try {
    const params: Record<string, string | number> = {};
    if (filters.username) params.username = filters.username;
    if (filters.account) params.account = filters.account;
    if (filters.ranks && filters.ranks.length > 0) params.ranks = filters.ranks.join(',');
    if (filters.regions && filters.regions.length > 0) params.regions = filters.regions.join(',');
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.page) params.page = filters.page;
    if (filters.pageSize) params.pageSize = filters.pageSize;

    const response = await axios.get<UserSearchResponse>(`${API_URL}/users/search`, { params });
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/users/${userId}`);
  } catch (err) {
    resolveApiError(err);
  }
}

export async function getUserInfo(userId: string): Promise<UserInfoResponse> {
  try {
    const response = await axios.get<UserInfoResponse>(`${API_URL}/users/${userId}/info`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export async function getUserEmail(userId: string): Promise<UserEmailResponse> {
  try {
    const response = await axios.get<UserEmailResponse>(`${API_URL}/users/${userId}/email`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export async function updateUser(userId: string, data: UpdateUserData): Promise<void> {
  try {
    await axios.put(`${API_URL}/users/${userId}`, data);
  } catch (err) {
    resolveApiError(err);
  }
}

export async function getUserDashboard(userId: string): Promise<UserDashboardResponse> {
  try {
    const response = await axios.get<UserDashboardResponse>(`${API_URL}/users/${userId}/dashboard`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

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

export async function updateBanner(userId: string, file: File): Promise<void> {
  try {
    const formData: FormData = new FormData();
    formData.append('userBanner', file);
    await axios.put(`${API_URL}/users/${userId}/banner`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (err) {
    resolveApiError(err);
  }
}

export async function getDashboard(userId: string): Promise<UserData> {
  const [info, profile] = await Promise.all([getUserInfo(userId), getUserDashboard(userId)]);

  return {
    userId,
    userInfo: { username: info.username, avatarPath: info.avatarPath },
    dashboard: { bio: profile.bio, tagline: profile.tagline, banner: profile.banner },
  };
}
