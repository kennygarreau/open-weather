import type { GeocodingResult } from './types';

const BASE_URL = 'https://geocoding-api.open-meteo.com/v1';

export async function searchLocations(query: string, count = 10): Promise<GeocodingResult[]> {
	if (!query.trim()) return [];

	const params = new URLSearchParams({
		name: query,
		count: String(count),
		language: 'en',
		format: 'json'
	});

	const res = await fetch(`${BASE_URL}/search?${params}`);
	if (!res.ok) throw new Error(`Geocoding request failed: ${res.status}`);

	const data = await res.json();
	return data.results ?? [];
}
