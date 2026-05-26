import { writable } from 'svelte/store';
import type { GeocodingResult } from '$lib/api/types';

const STORAGE_KEY = 'favorite_locations';

function createFavoritesStore() {
	let initial: GeocodingResult[] = [];

	if (typeof localStorage !== 'undefined') {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) initial = JSON.parse(raw);
		} catch {
			// ignore corrupt storage
		}
	}

	const { subscribe, update } = writable<GeocodingResult[]>(initial);

	function persist(locations: GeocodingResult[]) {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
		}
	}

	return {
		subscribe,
		add(location: GeocodingResult) {
			update((current) => {
				if (current.some((l) => l.id === location.id)) return current;
				const next = [...current, location];
				persist(next);
				return next;
			});
		},
		remove(id: number) {
			update((current) => {
				const next = current.filter((l) => l.id !== id);
				persist(next);
				return next;
			});
		},
		has(id: number, list: GeocodingResult[]): boolean {
			return list.some((l) => l.id === id);
		}
	};
}

export const favorites = createFavoritesStore();
