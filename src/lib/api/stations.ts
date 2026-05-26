// Station API helpers used by the server-side proxy route.
// Client-side store logic lives in src/lib/stores/stations.ts.

export async function fetchStationRaw(proxyUrl: string, stationUrl: string): Promise<unknown> {
	const res = await fetch(`${proxyUrl}/api/stations?url=${encodeURIComponent(stationUrl)}`);
	if (!res.ok) throw new Error(`Station request failed: ${res.status}`);
	return res.json();
}
