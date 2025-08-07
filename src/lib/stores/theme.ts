import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>('light');

	return {
		subscribe,
		init: () => {
			if (!browser) return;

			// Get saved theme or detect system preference
			const saved = localStorage.getItem('theme') as Theme | null;
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const theme = saved || (prefersDark ? 'dark' : 'light');

			set(theme);
			applyTheme(theme);

			// Listen for system theme changes
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
				if (!localStorage.getItem('theme')) {
					const newTheme = e.matches ? 'dark' : 'light';
					set(newTheme);
					applyTheme(newTheme);
				}
			});
		},
		toggle: () => {
			update(current => {
				const newTheme = current === 'light' ? 'dark' : 'light';
				applyTheme(newTheme);
				return newTheme;
			});
		},
		set: (theme: Theme) => {
			set(theme);
			applyTheme(theme);
		}
	};
}

function applyTheme(theme: Theme) {
	if (!browser) return;

	document.documentElement.setAttribute('data-theme', theme);
	document.documentElement.classList.toggle('dark', theme === 'dark');
	localStorage.setItem('theme', theme);

	// Update meta theme-color
	const metaThemeColor = document.querySelector('meta[name="theme-color"]');
	if (metaThemeColor) {
		metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
	}
}

export const theme = createThemeStore();
