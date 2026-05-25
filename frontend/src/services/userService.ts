import type { IUserDashboard } from '../models/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function getUserInfoUsername(username: string): Promise<IUserDashboard> {
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

export async function getUserInfoUserId(userId: string): Promise<IUserDashboard> {
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

export async function setUserInfo(userId: string | null, userInfo: Partial<IUserDashboard>): Promise<void> {
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

export async function getDashboard(username: string): Promise<IUserDashboard> {
	try {
		const response = await fetch(`${API_URL}/users/username/${username}/dashboard`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		const { message, userId, userInfo, userProfile } = await response.json();

		if (!response.ok) {
			throw new Error(`Failed to fetch dashboard info (${message}).`);
		}

		return { userId, userInfo, userProfile };
	} catch (error) {
		console.error('getDashboard', error);
		throw error;
	}
}

export async function updateDisplayName(userId: string, displayName: string): Promise<void> {
	try {
		const response = await fetch(`${API_URL}/users/${userId}/info`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ dashboard: { displayName } }),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(`Failed to update display name (${data.message}).`);
		}
	} catch (error) {
		console.error('updateDisplayName', error);
		throw error;
	}
}

export async function updateAvatar(userId: string, file: File): Promise<void> {
	try {
		const formData: FormData = new FormData();
		formData.append('userId', userId);
		formData.append('profileImage', file);

		const response = await fetch(`${API_URL}/users/avatar`, {
			method: 'POST',
			body: formData,
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(`Failed to update avatar (${data.message}).`);
		}
	} catch (error) {
		console.error('updateAvatar', error);
		throw error;
	}
}

export async function getUsername(userId: string): Promise<{ username: string }> {
	try {
		const response = await fetch(`${API_URL}/users/userId/${userId}/username`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(`Failed to fetch username (${data.message}).`);
		}

		return data;
	} catch (error) {
		console.error('getUsername', error);
		throw error;
	}
}
