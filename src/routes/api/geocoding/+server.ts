import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const BASE = env.OPEN_METEO_GEOCODING_URL || 'https://geocoding-api.open-meteo.com/v1';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q');
	if (!q) throw error(400, 'Missing query parameter: q');

	const count = url.searchParams.get('count') ?? '10';
	const params = new URLSearchParams({ name: q, count, language: 'en', format: 'json' });

	const res = await fetch(`${BASE}/search?${params}`);
	if (!res.ok) throw error(res.status, 'Upstream geocoding request failed');

	const data = await res.json();
	return json(data, {
		// City/country data is stable — cache for 24 hours.
		headers: { 'Cache-Control': 'public, max-age=86400' }
	});
};
