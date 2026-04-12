const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface AuthResponse {
	message: string;
	token?: string;
	userId?: string;
}

export async function registerUser(
	username: string,
	email: string,
	password: string,
): Promise<AuthResponse> {
	try {
		const response = await fetch(`${API_URL}/user/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, email, password }),
		});

		const data: AuthResponse = await response.json();

		if (!response.ok) {
			throw new Error(data.message || 'Registration failed');
		}

		return data;
	} catch (error) {
		console.error('Error in registerUser:', error);
		throw error;
	}
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
	try {
		const response = await fetch(`${API_URL}/user/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password }),
		});

		const data: AuthResponse = await response.json();

		if (!response.ok) {
			throw new Error(data.message || 'Login failed');
		}

		return data;
	} catch (error) {
		console.error('Error in loginUser:', error);
		throw error;
	}
}
