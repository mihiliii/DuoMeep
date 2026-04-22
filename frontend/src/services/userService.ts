import type { UserDashboard } from '../models/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function getUserInfoUsername(username: string): Promise<UserDashboard> {
	try {
		const response = await fetch(`${API_URL}/user/getUsingUsername/${username}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(`Failed to fetch user info (${data.message}).`);
		}

		return data;
	} catch (error) {
		console.error('getUserInfoUsername', error);
		throw error;
	}
}

export async function getUserInfoUserId(userId: string | null): Promise<UserDashboard> {
	try {
		if (!userId) {
			throw new Error('UserId is required to fetch user info');
		}

		const response = await fetch(`${API_URL}/user/getUsingUserId/${userId}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(`Failed to fetch user info (${data.message}).`);
		}

		return data;
	} catch (error) {
		console.error('getUserInfo', error);
		throw error;
	}
}

export async function setUserInfo(userId: string | null, userInfo: Partial<UserDashboard>): Promise<void> {
	try {
		if (!userId) {
			throw new Error('UserId is required to update user info');
		}

		const response = await fetch(`${API_URL}/user/update/${userId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(userInfo),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(`Failed to update user info (${data.message}).`);
		}

		return data;
	} catch (error) {
		console.error('setUserInfo', error);
		throw error;
	}
}
