import axios from 'axios';
import { apiUrl } from '../env';

export async function auth() {
	return axios.get(`${apiUrl}/auth`);
}

export async function setupOauthClientApi(code: string) {
	return axios.get(`${apiUrl}/auth/setup-oauth-client`, {
		params: { code }
	});
}

export async function getEventsByRange(
	start: string,
	end: string,
	signal?: AbortSignal,
) {
	return axios.get(`${apiUrl}/range`, {
		params: { start, end },
		signal,
	});
}
