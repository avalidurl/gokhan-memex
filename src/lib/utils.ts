import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
}

// Re-export performance monitoring utilities for easy access
export { createPerformanceMonitor, measurePerformance, measureAsyncPerformance } from './performance'
export { initializeAnalytics, getAnalytics, setupAutoTracking } from './analytics'
export { initializePerformanceDashboard, performanceDebug } from './performance-dashboard'
export { initializeRUM } from './rum'
export { initializePerformanceAlerts } from './performance-alerts'