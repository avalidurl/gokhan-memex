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

export function humanizeKebab(text: string): string {
  return text.replace(/-/g, ' ')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Render journal titles that use ~~strikethrough~~ markdown syntax. */
export function renderPostTitle(title: string): string {
  const parts: string[] = []
  const regex = /~~([^~]+)~~/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(title)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(title.slice(lastIndex, match.index)))
    }
    parts.push(`<del>${escapeHtml(match[1])}</del>`)
    lastIndex = regex.lastIndex
  }

  if (lastIndex < title.length) {
    parts.push(escapeHtml(title.slice(lastIndex)))
  }

  return parts.join('')
}

/** Plain-text title for SEO, RSS, and schema metadata. */
export function plainPostTitle(title: string): string {
  return title.replace(/~~([^~]+)~~/g, '$1')
}

// Re-export analytics utilities
export { initializeAnalytics, getAnalytics, setupAutoTracking } from './analytics'
