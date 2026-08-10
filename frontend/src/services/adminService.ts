import axios from 'axios';

import API_URL from '@/config/api';

import { resolveApiError } from './apiError';

export type AdminAuthResponse = {
  message: string;
  adminId: string;
};

export async function loginAdmin(username: string, password: string): Promise<AdminAuthResponse> {
  try {
    const response = await axios.post<AdminAuthResponse>(`${API_URL}/admin/login`, { username, password });
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}
