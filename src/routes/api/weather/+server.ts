import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const BASE = env.OPEN_METEO_URL || 'https://api.open-meteo.com/v1';

const ALLOWED_PARAMS = new Set([
	'latitude',
	'longitude',
	'current',
	'hourly',
	'daily',
	'temperature_unit',
	'wind_speed_unit',
	'precipitation_unit',
	'timezone',
	'forecast_days'
]);

export const GET: RequestHandler = async ({ url }) => {
	const lat = url.searchParams.get('latitude');
	const lon = url.searchParams.get('longitude');
	if (!lat || !lon) throw error(400, 'Missing required parameters: latitude, longitude');

	// Forward only known/safe params to upstream
	const params = new URLSearchParams();
	for (const [key, value] of url.searchParams.entries()) {
		if (ALLOWED_PARAMS.has(key)) params.set(key, value);
	}

	const res = await fetch(`${BASE}/forecast?${params}`);
	if (!res.ok) throw error(res.status, 'Upstream weather request failed');

	const data = await res.json();
	return json(data, {
		headers: {
			// Fresh for 10 min; browser may serve stale for another 60 s while revalidating.
			'Cache-Control': 'public, max-age=600, stale-while-revalidate=60'
		}
	});
};
