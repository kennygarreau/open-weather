import { writable } from 'svelte/store';
import type { GeocodingResult } from '$lib/api/types';

const STORAGE_KEY = 'selected_location';

function createLocationStore() {
	let initial: GeocodingResult | null = null;

	if (typeof localStorage !== 'undefined') {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) initial = JSON.parse(raw);
		} catch {
			// ignore corrupt storage
		}
	}

	const { subscribe, set } = writable<GeocodingResult | null>(initial);

	return {
		subscribe,
		select(location: GeocodingResult) {
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
			}
			set(location);
		},
		clear() {
			if (typeof localStorage !== 'undefined') {
				localStorage.removeItem(STORAGE_KEY);
			}
			set(null);
		}
	};
}

export const selectedLocation = createLocationStore();
