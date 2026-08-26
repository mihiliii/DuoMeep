import axios from 'axios';

import API_URL from '@/config/api';
import type { Rank, Region } from '@/enums/account';

import { resolveApiError } from './apiError';

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

export type GameAccount = {
  _id: string;
  name: string;
  region: Region;
  rank: Rank;
  userId: string;
  status: string;
};

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

export async function getGameAccountId(name: string): Promise<GameAccountIdResponse> {
  try {
    const response = await axios.get<GameAccountIdResponse>(`${API_URL}/gameaccounts/name/${name}/id`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export async function getGameAccount(gameAccountId: string): Promise<GameAccount> {
  try {
    const response = await axios.get<GameAccount>(`${API_URL}/gameaccounts/${gameAccountId}`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export async function getGameAccountByUserId(userId: string): Promise<GameAccount> {
  try {
    const response = await axios.get<GameAccount>(`${API_URL}/gameaccounts/user/${userId}`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export async function updateGameAccount(gameAccountId: string, data: UpdateGameAccountData): Promise<void> {
  try {
    await axios.put(`${API_URL}/gameaccounts/${gameAccountId}`, data);
  } catch (err) {
    resolveApiError(err);
  }
}

export async function deleteGameAccount(gameAccountId: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/gameaccounts/${gameAccountId}`);
  } catch (err) {
    resolveApiError(err);
  }
}
