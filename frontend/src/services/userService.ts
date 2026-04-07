import type { UserInfo } from '../models/user';

const API_URL = import.meta.env.API_URL || 'http://localhost:5000';

export async function getUserInfo(userId: string): Promise<UserInfo> {
	try {
		const response = await fetch(`${API_URL}/user/${userId}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			throw new Error('Failed to fetch user info');
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error in getUserInfo:', error);
		throw error;
	}
}
