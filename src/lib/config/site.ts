export const siteConfig = {
	name: 'Gökhan Memex',
	description: 'Premium digital garden and memex for thoughtful content on finance, art, and technology.',
	url: 'https://gokhanturhan.com',
	author: {
		name: 'Gökhan Turhan',
		email: 'hello@gokhanturhan.com',
		twitter: '@avalidurl',
		github: 'avalidurl'
	},
	social: {
		twitter: 'https://twitter.com/avalidurl',
		github: 'https://github.com/avalidurl',
		linkedin: 'https://linkedin.com/in/gokhanturhan'
	},
	analytics: {
		// Configure your analytics IDs here
		gtag: '',
		plausible: ''
	},
	features: {
		search: true,
		comments: false,
		newsletter: true,
		darkMode: true,
		rss: true
	},
	content: {
		postsPerPage: 10,
		excerptLength: 160,
		readingTime: true
	},
	seo: {
		keywords: [
			'digital garden',
			'memex',
			'finance',
			'technology',
			'art',
			'blog',
			'gokhan turhan'
		],
		ogImage: '/images/og-default.png',
		twitterCard: 'summary_large_image'
	}
} as const;

export type SiteConfig = typeof siteConfig;
