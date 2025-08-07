/**
 * Date formatting utilities for the memex
 */

export function formatDate(date: Date | string, options?: {
	format?: 'short' | 'medium' | 'long' | 'relative';
	locale?: string;
}): string {
	const { format = 'medium', locale = 'en-US' } = options || {};
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	
	// Handle invalid dates
	if (!dateObj || isNaN(dateObj.getTime())) {
		return 'Invalid Date';
	}

	switch (format) {
		case 'short':
			return dateObj.toLocaleDateString(locale, {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			});
		case 'medium':
			return dateObj.toLocaleDateString(locale, {
				month: 'long',
				day: 'numeric',
				year: 'numeric'
			});
		case 'long':
			return dateObj.toLocaleDateString(locale, {
				weekday: 'long',
				month: 'long',
				day: 'numeric',
				year: 'numeric'
			});
		case 'relative':
			return formatRelativeDate(dateObj);
		default:
			return dateObj.toLocaleDateString(locale);
	}
}

export function formatRelativeDate(date: Date | string): string {
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const diffInMs = now.getTime() - dateObj.getTime();
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
	const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

	if (diffInMinutes < 60) {
		return diffInMinutes <= 1 ? 'just now' : `${diffInMinutes} minutes ago`;
	}
	
	if (diffInHours < 24) {
		return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
	}
	
	if (diffInDays < 7) {
		return diffInDays === 1 ? 'yesterday' : `${diffInDays} days ago`;
	}
	
	if (diffInDays < 30) {
		const weeks = Math.floor(diffInDays / 7);
		return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
	}
	
	if (diffInDays < 365) {
		const months = Math.floor(diffInDays / 30);
		return months === 1 ? '1 month ago' : `${months} months ago`;
	}
	
	const years = Math.floor(diffInDays / 365);
	return years === 1 ? '1 year ago' : `${years} years ago`;
}

export function formatReadingTime(minutes: number): string {
	if (minutes < 1) return '< 1 min read';
	if (minutes === 1) return '1 min read';
	return `${minutes} min read`;
}

export function parseDate(dateString: string): Date {
	return new Date(dateString);
}

export function isValidDate(date: Date): boolean {
	return date instanceof Date && !isNaN(date.getTime());
}

export function getDateRangeString(start: Date, end?: Date): string {
	const startStr = formatDate(start, { format: 'short' });
	if (!end) return startStr;
	
	const endStr = formatDate(end, { format: 'short' });
	return `${startStr} - ${endStr}`;
}

export function sortByDate<T extends { publishedAt: Date }>(
	items: T[],
	order: 'asc' | 'desc' = 'desc'
): T[] {
	return items.sort((a, b) => {
		const comparison = b.publishedAt.getTime() - a.publishedAt.getTime();
		return order === 'desc' ? comparison : -comparison;
	});
}

export function groupByMonth<T extends { publishedAt: Date }>(items: T[]): Record<string, T[]> {
	return items.reduce((groups, item) => {
		const monthKey = item.publishedAt.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long'
		});
		
		if (!groups[monthKey]) {
			groups[monthKey] = [];
		}
		
		groups[monthKey].push(item);
		return groups;
	}, {} as Record<string, T[]>);
}

export function groupByYear<T extends { publishedAt: Date }>(items: T[]): Record<string, T[]> {
	return items.reduce((groups, item) => {
		const yearKey = item.publishedAt.getFullYear().toString();
		
		if (!groups[yearKey]) {
			groups[yearKey] = [];
		}
		
		groups[yearKey].push(item);
		return groups;
	}, {} as Record<string, T[]>);
}
