import axios from 'axios';
import API_URL from '../config/api';
import { resolveApiError } from './apiError';
import type { Rank, Region } from '../types/account';

export type CreateGameAccountData = {
  name: string;
  region: Region;
  rank?: Rank;
};

export type UpdateGameAccountData = Partial<CreateGameAccountData>;

export type CreateGameAccountResponse = {
  message: string;
  gameAccountId: string;
};

export type GameAccountIdResponse = {
  message: string;
  gameAccountId: string;
};

export type GameAccountResponse = {
  _id: string;
  name: string;
  region: Region;
  rank: Rank;
  userId: string;
  status: string;
};

/**
 * Creates a GameAccount for the given user ID.
 *
 * @param userId - The user's ID
 * @param data - `CreateGameAccountData` containing name, region and optional rank
 * @returns `CreateGameAccountResponse` containing the new `gameAccountId`
 * @throws if the account name is taken, or the user already has a GameAccount
 */
export async function createGameAccount(
  userId: string,
  data: CreateGameAccountData,
): Promise<CreateGameAccountResponse> {
  try {
    const response = await axios.post<CreateGameAccountResponse>(`${API_URL}/gameaccounts/${userId}`, data);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

/**
 * Resolves a GameAccount name to its ID.
 *
 * @param name - The GameAccount's name
 * @returns `GameAccountIdResponse` containing the `gameAccountId`
 * @throws if no GameAccount exists with the given name
 */
export async function getGameAccountId(name: string): Promise<GameAccountIdResponse> {
  try {
    const response = await axios.get<GameAccountIdResponse>(`${API_URL}/gameaccounts/name/${name}/id`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

/**
 * Fetches a GameAccount by its ID.
 *
 * @param gameAccountId - The GameAccount's ID
 * @returns `GameAccountResponse` containing the account's name, region, rank and owning userId
 * @throws if no GameAccount exists with the given ID
 */
export async function getGameAccount(gameAccountId: string): Promise<GameAccountResponse> {
  try {
    const response = await axios.get<GameAccountResponse>(`${API_URL}/gameaccounts/${gameAccountId}`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

/**
 * Updates a GameAccount by its ID.
 *
 * @param gameAccountId - The GameAccount's ID
 * @param data - Partial `UpdateGameAccountData` fields to update
 * @throws if no GameAccount exists with the given ID
 */
export async function updateGameAccount(gameAccountId: string, data: UpdateGameAccountData): Promise<void> {
  try {
    await axios.put(`${API_URL}/gameaccounts/${gameAccountId}`, data);
  } catch (err) {
    resolveApiError(err);
  }
}

/**
 * Deletes (soft-deletes) a GameAccount by its ID.
 *
 * @param gameAccountId - The GameAccount's ID
 * @throws if no GameAccount exists with the given ID
 */
export async function deleteGameAccount(gameAccountId: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/gameaccounts/${gameAccountId}`);
  } catch (err) {
    resolveApiError(err);
  }
}
