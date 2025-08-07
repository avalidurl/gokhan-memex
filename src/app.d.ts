// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { User } from '$lib/types/user';

declare global {
	namespace App {
		// interface Error {}
		
		interface Locals {
			user?: User;
			theme?: 'light' | 'dark';
		}
		
		interface PageData {
			meta?: {
				title?: string;
				description?: string;
				keywords?: string;
				author?: string;
				image?: string;
				type?: 'website' | 'article' | 'blog';
				publishedTime?: string;
				modifiedTime?: string;
				section?: string;
				tags?: string[];
			};
			breadcrumbs?: Array<{
				label: string;
				href: string;
			}>;
		}
		
		// interface PageState {}
		// interface Platform {}
	}
	
	// Global constants injected by Vite
	declare const __BUILD_TIME__: string;
	declare const __VERSION__: string;
	
	// Window extensions for analytics and performance monitoring
	interface Window {
		dataLayer?: any[];
		gtag?: (...args: any[]) => void;
		webVitals?: any;
		plausible?: (...args: any[]) => void;
	}
}

export {};
