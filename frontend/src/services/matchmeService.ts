import axios from 'axios';
import API_URL from '../config/api';
import { resolveApiError } from './apiError';
import type { Rank, Region, Role } from '../types/account';

export type CreateMatchMeData = {
  roles: Role[];
  description: string;
  requirements: Record<string, unknown>;
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
  requirements: Record<string, unknown>;
  status: string;
};

/**
 * Creates a MatchMe posting for the given user ID.
 *
 * @param userId - The user's ID
 * @param data - `CreateMatchMeData` containing roles, description and requirements
 * @returns `CreateMatchMeResponse` containing the new `matchMeId`
 * @throws if the user has no GameAccount, or already has a MatchMe posting
 */
export async function createMatchMe(userId: string, data: CreateMatchMeData): Promise<CreateMatchMeResponse> {
  try {
    const response = await axios.post<CreateMatchMeResponse>(`${API_URL}/matchme/${userId}`, data);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

/**
 * Fetches the MatchMe posting for the given user ID.
 *
 * @param userId - The user's ID
 * @returns `MatchMeResponse` containing the posting's roles, description, requirements and status
 * @throws if no MatchMe posting exists for the given user ID
 */
export async function getMatchMe(userId: string): Promise<MatchMeResponse> {
  try {
    const response = await axios.get<MatchMeResponse>(`${API_URL}/matchme/${userId}`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

/**
 * Updates the MatchMe posting for the given user ID.
 *
 * @param userId - The user's ID
 * @param data - Partial `UpdateMatchMeData` fields to update
 * @throws if no MatchMe posting exists for the given user ID
 */
export async function updateMatchMe(userId: string, data: UpdateMatchMeData): Promise<void> {
  try {
    await axios.put(`${API_URL}/matchme/${userId}`, data);
  } catch (err) {
    resolveApiError(err);
  }
}

/**
 * Deletes (soft-deletes) the MatchMe posting for the given user ID.
 *
 * @param userId - The user's ID
 * @throws if no MatchMe posting exists for the given user ID
 */
export async function deleteMatchMe(userId: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/matchme/${userId}`);
  } catch (err) {
    resolveApiError(err);
  }
}

export type MatchMePosting = {
  matchMeId: string;
  userId: string;
  username: string;
  avatarPath: string;
  rank: Rank;
  region: Region;
  roles: Role[];
  description: string;
  requirements: Record<string, unknown>;
};

export type ListMatchMeFilters = {
  ranks?: Rank[];
  roles?: Role[];
  regions?: Region[];
  search?: string;
  page?: number;
  pageSize?: number;
};

export type ListMatchMeResponse = {
  message: string;
  postings: MatchMePosting[];
  totalCount: number;
  totalPages: number;
  page: number;
};

/**
 * Fetches a filtered, paginated list of active MatchMe postings.
 *
 * @param filters - `ListMatchMeFilters` for ranks, roles, regions, search text, page and pageSize
 * @returns `ListMatchMeResponse` containing the matching `postings` and pagination info
 */
export async function listMatchMe(filters: ListMatchMeFilters): Promise<ListMatchMeResponse> {
  try {
    const params: Record<string, string | number> = {};
    if (filters.ranks && filters.ranks.length > 0) params.ranks = filters.ranks.join(',');
    if (filters.roles && filters.roles.length > 0) params.roles = filters.roles.join(',');
    if (filters.regions && filters.regions.length > 0) params.regions = filters.regions.join(',');
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.pageSize) params.pageSize = filters.pageSize;

    const response = await axios.get<ListMatchMeResponse>(`${API_URL}/matchme`, { params });
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}
