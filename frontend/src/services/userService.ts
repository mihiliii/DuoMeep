import type { UserDashboard } from '../models/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function getUserInfo(userId: string | null): Promise<UserDashboard> {
	try {
		if (!userId) {
			throw new Error('UserId is required to fetch user info');
		}

		const response = await fetch(`${API_URL}/user/get/${userId}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			throw new Error('Failed to fetch user info');
		}

		const data = await response.json().catch((err) => {
			console.error('Error parsing JSON response:', err);
			throw new Error('Invalid JSON response from server');
		});
		return data;
	} catch (error) {
		console.error('Error in getUserInfo:', error);
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

		if (!response.ok) {
			throw new Error('Failed to update user info');
		}

		const data = await response.json().catch((err) => {
			console.error('Error parsing JSON response:', err);
			throw new Error('Invalid JSON response from server');
		});
		return data;
	} catch (error) {
		console.error('Error in setUserInfo:', error);
		throw error;
	}
}
