import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

// Create a writable store for the theme
function createThemeStore() {
	// Default to 'light' theme
	const { subscribe, set, update } = writable<Theme>('light');

	return {
		subscribe,
		set,
		update,
		// Toggle between light and dark
		toggle: () => update(theme => theme === 'light' ? 'dark' : 'light'),
		// Initialize theme from localStorage or system preference
		init: () => {
			if (!browser) return;

			// Check localStorage first
			const stored = localStorage.getItem('theme') as Theme | null;
			if (stored) {
				set(stored);
				applyTheme(stored);
				return;
			}

			// Fall back to system preference
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const systemTheme: Theme = prefersDark ? 'dark' : 'light';
			set(systemTheme);
			applyTheme(systemTheme);
		}
	};
}

export const theme = createThemeStore();

// Apply theme to DOM and save to localStorage
function applyTheme(newTheme: Theme) {
	if (!browser) return;

	const root = document.documentElement;
	
	// Remove existing theme classes
	root.classList.remove('light', 'dark');
	
	// Add new theme class
	root.classList.add(newTheme);
	
	// Update meta theme-color for mobile browsers
	const metaThemeColor = document.querySelector('meta[name="theme-color"]');
	if (metaThemeColor) {
		metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#0f172a' : '#ffffff');
	}
	
	// Save to localStorage
	localStorage.setItem('theme', newTheme);
}

// Subscribe to theme changes and apply them
if (browser) {
	theme.subscribe(applyTheme);
	
	// Listen for system theme changes
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		// Only update if user hasn't set a preference
		const stored = localStorage.getItem('theme');
		if (!stored) {
			theme.set(e.matches ? 'dark' : 'light');
		}
	});
}
