export type Ebook = {
  slug: string
  title: string
  subtitle: string
  author: string
  description: string
  blurb: string
  coverImage: string
  epubUrl: string
  browserEditionUrl: string
  staticHtmlUrl: string
  sourceTextPath: string
  lineCount: number
  linesPerPage: number
  pageCount: number
  protocols: string[]
  publishedOn: string
}

export const ebooks: Ebook[] = [
  {
    slug: 'an-essay-concerning-the-inbox',
    title: 'An Essay Concerning the Inbox',
    subtitle: 'A Lockean poem in twenty cantos and one thousand lines',
    author: 'Gökhan Turhan',
    description: 'A born-digital poetry edition pairing Lockean empiricism with the long tail of Unix mail history.',
    blurb:
      'An Essay Concerning the Inbox is a long poem that takes Locke’s language of sensation, reflection, memory, and identity and routes it through the lived material of Unix mail culture: phosphor screens, /var/spool, polling daemons, and the improbable dignity of names like fetchpop, PopTart, get-mail, gwpop, pimp, pop-perl, popc, popmail, and upop.',
    coverImage: '/publishing/ebooks/an-essay-concerning-the-inbox/cover.png',
    epubUrl: '/publishing/ebooks/an-essay-concerning-the-inbox/an-essay-concerning-the-inbox.epub',
    browserEditionUrl: '/publishing/ebooks/an-essay-concerning-the-inbox/read/',
    staticHtmlUrl: '/publishing/ebooks/an-essay-concerning-the-inbox/browser-edition.html',
    sourceTextPath: 'public/publishing/ebooks/an-essay-concerning-the-inbox/poem.txt',
    lineCount: 1000,
    linesPerPage: 20,
    pageCount: 50,
    protocols: ['fetchpop', 'PopTart', 'get-mail', 'gwpop', 'pimp', 'pop-perl', 'popc', 'popmail', 'upop'],
    publishedOn: '2026-04-04',
  },
]

export const getEbookBySlug = (slug: string) => ebooks.find((ebook) => ebook.slug === slug)
