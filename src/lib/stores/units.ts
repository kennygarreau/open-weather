import { writable } from 'svelte/store';

export interface UnitPreferences {
	temperature: 'celsius' | 'fahrenheit';
	windSpeed: 'kmh' | 'mph' | 'ms';
	precipitation: 'mm' | 'inch';
	timeFormat: '12h' | '24h';
}

const STORAGE_KEY = 'unit_prefs';

const defaults: UnitPreferences = {
	temperature: 'celsius',
	windSpeed: 'kmh',
	precipitation: 'mm',
	timeFormat: '12h'
};

function createUnitsStore() {
	let initial = { ...defaults };

	if (typeof localStorage !== 'undefined') {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) initial = { ...defaults, ...JSON.parse(raw) };
		} catch {
			// ignore
		}
	}

	const { subscribe, update } = writable<UnitPreferences>(initial);

	return {
		subscribe,
		set(prefs: Partial<UnitPreferences>) {
			update((current) => {
				const next = { ...current, ...prefs };
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
				}
				return next;
			});
		}
	};
}

export const units = createUnitsStore();
