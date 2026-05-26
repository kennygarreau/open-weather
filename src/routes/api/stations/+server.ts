import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Proxy endpoint for custom local weather stations.
 * Clients pass the station URL as a query parameter; the server fetches it
 * server-side to avoid CORS issues with local network stations.
 *
 * GET /api/stations?url=http://my-weather-station.local/api/data
 */
export const GET: RequestHandler = async ({ url }) => {
	const stationUrl = url.searchParams.get('url');
	if (!stationUrl) throw error(400, 'Missing required parameter: url');

	let parsed: URL;
	try {
		parsed = new URL(stationUrl);
	} catch {
		throw error(400, 'Invalid station URL');
	}

	// Only allow http/https schemes to prevent SSRF via other protocols
	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		throw error(400, 'Station URL must use http or https');
	}

	const res = await fetch(stationUrl, { signal: AbortSignal.timeout(5000) });
	if (!res.ok) throw error(res.status, `Station returned ${res.status}`);

	const data = await res.json();
	return json(data);
};
