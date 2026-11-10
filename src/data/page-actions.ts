/** Per-page action buttons shown under the file strip, and pages whose body runs the full sheet width. */
export interface PageAction { label?: string; links: { text: string; href: string; download?: boolean }[] }

export const pageActions: Record<string, PageAction[]> = {
  '/coins/': [{ links: [{ text: 'Leaderboard →', href: '/coins/leaderboard/' }] }],
  '/coins/leaderboard/': [{ links: [{ text: '← Back to all coins', href: '/coins/' }] }],
  '/ubu/reader/': [
    {
      label: 'Download the whole book',
      links: [
        { text: 'PDF', href: '/media/archive/ubu/ubu/the-bureau-reader-complete.pdf', download: true },
        { text: 'EPUB', href: '/media/archive/ubu/ubu/the-bureau-reader-complete.epub', download: true },
      ],
    },
  ],
}

/** Data pages: tables and tools get the whole width instead of the reading measure. */
export const widePages = new Set<string>(['/coins/', '/coins/leaderboard/'])
