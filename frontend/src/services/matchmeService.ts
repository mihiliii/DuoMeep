import axios from 'axios';
import API_URL from '../config/api';
import { resolveApiError } from './apiError';
import type { Rank, Region, Role } from '../types/account';

export type CreateMatchMeData = {
  roles: Role[];
  description: string;
};

export type UpdateMatchMeData = Partial<CreateMatchMeData>;

export type CreateMatchMeResponse = {
  message: string;
  matchMeId: string;
};

export type MatchMeResponse = {
  message: string;
  _id: string;
  dateCreated: string;
  userId: string;
  roles: Role[];
  description: string;
  status: string;
};

export async function createMatchMe(userId: string, data: CreateMatchMeData): Promise<CreateMatchMeResponse> {
  try {
    const response = await axios.post<CreateMatchMeResponse>(`${API_URL}/matchme/${userId}`, data);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export async function getMatchMe(userId: string): Promise<MatchMeResponse> {
  try {
    const response = await axios.get<MatchMeResponse>(`${API_URL}/matchme/${userId}`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export async function updateMatchMe(userId: string, data: UpdateMatchMeData): Promise<void> {
  try {
    await axios.put(`${API_URL}/matchme/${userId}`, data);
  } catch (err) {
    resolveApiError(err);
  }
}

export async function deleteMatchMe(userId: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/matchme/${userId}`);
  } catch (err) {
    resolveApiError(err);
  }
}

export type MatchMePost = {
  matchMeId: string;
  userId: string;
  username: string;
  tagline: string;
  avatarPath: string;
  accountName: string;
  rank: Rank;
  region: Region;
  roles: Role[];
  description: string;
  dateCreated: string;
};

export type ListMatchMeFilters = {
  ranks?: Rank[];
  roles?: Role[];
  regions?: Region[];
  search?: string;
  username?: string;
  account?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
};

export type ListMatchMeResponse = {
  message: string;
  posts: MatchMePost[];
  totalCount: number;
  totalPages: number;
  page: number;
};

export async function listMatchMe(filters: ListMatchMeFilters): Promise<ListMatchMeResponse> {
  try {
    const params: Record<string, string | number> = {};
    if (filters.ranks && filters.ranks.length > 0) params.ranks = filters.ranks.join(',');
    if (filters.roles && filters.roles.length > 0) params.roles = filters.roles.join(',');
    if (filters.regions && filters.regions.length > 0) params.regions = filters.regions.join(',');
    if (filters.search) params.search = filters.search;
    if (filters.username) params.username = filters.username;
    if (filters.account) params.account = filters.account;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.page) params.page = filters.page;
    if (filters.pageSize) params.pageSize = filters.pageSize;

    const response = await axios.get<ListMatchMeResponse>(`${API_URL}/matchme`, { params });
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}
