import { humanizeKebab } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href: string
}

const SEGMENT_LABELS: Record<string, string> = {
  cv: 'CV',
  journal: 'Journal',
  archive: 'Archive',
  lists: 'Lists',
  publishing: 'Publishing',
  projects: 'Projects',
  subscribe: 'Contact',
  writing: 'Writing',
  privacy: 'Privacy',
  disclaimer: 'Disclaimer',
  search: 'Search',
  ebooks: 'E-books',
  categories: 'Categories',
  tags: 'Tags',
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function labelForSegment(segment: string): string {
  const key = segment.toLowerCase()
  if (SEGMENT_LABELS[key]) return SEGMENT_LABELS[key]
  if (/^\d{4}$/.test(segment)) return segment
  if (/^(0[1-9]|1[0-2])$/.test(segment)) {
    return MONTH_NAMES[parseInt(segment, 10) - 1] ?? segment
  }
  return humanizeKebab(segment)
}

function fixIntermediateHref(href: string): string {
  if (href === '/archive/categories/') return '/archive/#categories'
  return href
}

/**
 * Auto-generate breadcrumb trail from URL path + page title (as passed to BaseLayout).
 * Returns null for the site root.
 */
export function getAutoBreadcrumbs(
  pathname: string,
  pageTitle: string
): { items: BreadcrumbItem[]; currentPage: string } | null {
  const normalized = pathname.replace(/\/$/, '') || '/'
  if (normalized === '/') return null

  let currentPage = pageTitle.trim()
  if (currentPage.endsWith(' - Archive')) {
    currentPage = currentPage.replace(/ - Archive$/, '').trim()
  }

  const segments = normalized.split('/').filter(Boolean)
  if (segments.length === 0) return null

  const items: BreadcrumbItem[] = []
  for (let i = 0; i < segments.length - 1; i++) {
    const parts = segments.slice(0, i + 1)
    let href = '/' + parts.join('/') + '/'
    href = fixIntermediateHref(href)
    const seg = segments[i]
    items.push({
      label: labelForSegment(seg),
      href,
    })
  }

  return { items, currentPage }
}
