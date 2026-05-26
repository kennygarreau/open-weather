import { writable, derived, get } from 'svelte/store';
import type { StationConfig, StationObservation, StationFieldMap } from '$lib/api/types';

const STATIONS_KEY = 'station_configs';
const ACTIVE_KEY = 'active_station_id';
const POLL_INTERVAL_MS = 60_000;

// Resolve a dot-notation path against an arbitrary JSON object.
function resolvePath(obj: unknown, path: string): unknown {
	return path.split('.').reduce<unknown>((acc, key) => {
		if (acc !== null && typeof acc === 'object') {
			return (acc as Record<string, unknown>)[key];
		}
		return undefined;
	}, obj);
}

function toNumber(v: unknown): number | undefined {
	const n = Number(v);
	return isFinite(n) ? n : undefined;
}

function mapObservation(raw: unknown, fieldMap: StationFieldMap): StationObservation {
	return {
		fetchedAt: new Date().toISOString(),
		temperature: fieldMap.temperature ? toNumber(resolvePath(raw, fieldMap.temperature)) : undefined,
		humidity: fieldMap.humidity ? toNumber(resolvePath(raw, fieldMap.humidity)) : undefined,
		pressure: fieldMap.pressure ? toNumber(resolvePath(raw, fieldMap.pressure)) : undefined,
		windSpeed: fieldMap.windSpeed ? toNumber(resolvePath(raw, fieldMap.windSpeed)) : undefined,
		windDirection: fieldMap.windDirection
			? toNumber(resolvePath(raw, fieldMap.windDirection))
			: undefined,
		precipitation: fieldMap.precipitation
			? toNumber(resolvePath(raw, fieldMap.precipitation))
			: undefined
	};
}

function load<T>(key: string, fallback: T): T {
	if (typeof localStorage === 'undefined') return fallback;
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}

function save(key: string, value: unknown) {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(key, JSON.stringify(value));
	}
}

function createStationStore() {
	const configs = writable<StationConfig[]>(load(STATIONS_KEY, []));
	const activeId = writable<string | null>(load(ACTIVE_KEY, null));
	const observation = writable<StationObservation | null>(null);
	const loading = writable(false);
	const error = writable<string | null>(null);

	const activeStation = derived([configs, activeId], ([cs, id]) =>
		id ? (cs.find((s) => s.id === id) ?? null) : null
	);

	let pollTimer: ReturnType<typeof setInterval> | null = null;

	async function fetchObservation(station: StationConfig): Promise<void> {
		loading.set(true);
		error.set(null);
		try {
			const res = await fetch(`/api/stations?url=${encodeURIComponent(station.url)}`);
			if (!res.ok) throw new Error(`Station returned HTTP ${res.status}`);
			const raw = await res.json();
			observation.set(mapObservation(raw, station.fieldMap));
		} catch (e) {
			error.set(e instanceof Error ? e.message : 'Unknown error');
		} finally {
			loading.set(false);
		}
	}

	function startPolling() {
		stopPolling();
		const station = get(activeStation);
		if (!station) return;
		fetchObservation(station);
		pollTimer = setInterval(() => {
			const s = get(activeStation);
			if (s) fetchObservation(s);
		}, POLL_INTERVAL_MS);
	}

	function stopPolling() {
		if (pollTimer !== null) {
			clearInterval(pollTimer);
			pollTimer = null;
		}
	}

	// Restart polling whenever the active station changes.
	activeStation.subscribe((s) => {
		if (s) {
			startPolling();
		} else {
			stopPolling();
			observation.set(null);
			error.set(null);
		}
	});

	return {
		configs: { subscribe: configs.subscribe },
		activeStation: { subscribe: activeStation.subscribe },
		activeId: { subscribe: activeId.subscribe },
		observation: { subscribe: observation.subscribe },
		loading: { subscribe: loading.subscribe },
		error: { subscribe: error.subscribe },

		addStation(config: StationConfig) {
			configs.update((cs) => {
				const next = [...cs.filter((c) => c.id !== config.id), config];
				save(STATIONS_KEY, next);
				return next;
			});
		},

		removeStation(id: string) {
			configs.update((cs) => {
				const next = cs.filter((c) => c.id !== id);
				save(STATIONS_KEY, next);
				return next;
			});
			activeId.update((current) => {
				if (current === id) {
					save(ACTIVE_KEY, null);
					return null;
				}
				return current;
			});
		},

		setActive(id: string | null) {
			activeId.set(id);
			save(ACTIVE_KEY, id);
		},

		refresh() {
			const station = get(activeStation);
			if (station) fetchObservation(station);
		},

		/** One-shot fetch for testing a station URL before saving. */
		async testStation(
			url: string,
			fieldMap: StationFieldMap
		): Promise<{ observation: StationObservation; raw: unknown }> {
			const res = await fetch(`/api/stations?url=${encodeURIComponent(url)}`);
			if (!res.ok) throw new Error(`Station returned HTTP ${res.status}`);
			const raw = await res.json();
			return { observation: mapObservation(raw, fieldMap), raw };
		}
	};
}

export const stationStore = createStationStore();
