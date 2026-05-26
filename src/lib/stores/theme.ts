import { writable, get } from 'svelte/store';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function createThemeStore() {
	let initial: Theme = 'light';

	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		if (stored === 'light' || stored === 'dark') {
			initial = stored;
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			initial = 'dark';
		}
	}

	const { subscribe, set } = writable<Theme>(initial);

	function apply(theme: Theme) {
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', theme === 'dark');
		}
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, theme);
		}
		set(theme);
	}

	return {
		subscribe,
		toggle() {
			apply(get({ subscribe }) === 'dark' ? 'light' : 'dark');
		},
		init() {
			apply(initial);
		}
	};
}

export const theme = createThemeStore();
