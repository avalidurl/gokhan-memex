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
  toc: {
    number: number
    title: string
    anchor: string
    startLine: number
  }[]
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
    toc: [
      { number: 1, title: 'Tabula Rasa at Login', anchor: 'tabula-rasa-at-login', startLine: 1 },
      { number: 2, title: 'Port 110 at Dawn', anchor: 'port-110-at-dawn', startLine: 51 },
      { number: 3, title: 'Labor in /var/spool', anchor: 'labor-in-var-spool', startLine: 101 },
      { number: 4, title: 'Substance, Header, Body', anchor: 'substance-header-body', startLine: 151 },
      { number: 5, title: 'Midnight and Personal Identity', anchor: 'midnight-and-personal-identity', startLine: 201 },
      { number: 6, title: 'Consent of Daemons', anchor: 'consent-of-daemons', startLine: 251 },
      { number: 7, title: 'GNU Weather, BSD Light', anchor: 'gnu-weather-bsd-light', startLine: 301 },
      { number: 8, title: 'UUCP Roads and Bang Paths', anchor: 'uucp-roads-and-bang-paths', startLine: 351 },
      { number: 9, title: 'The Nine Candidates', anchor: 'the-nine-candidates', startLine: 401 },
      { number: 10, title: 'Fetchmail after Empiricism', anchor: 'fetchmail-after-empiricism', startLine: 451 },
      { number: 11, title: 'The Archive of Impressions', anchor: 'the-archive-of-impressions', startLine: 501 },
      { number: 12, title: 'Errors, Retries, and Human Understanding', anchor: 'errors-retries-and-human-understanding', startLine: 551 },
      { number: 13, title: 'Pine Needles, Elm Shade, Mutt Footsteps', anchor: 'pine-needles-elm-shade-mutt-footsteps', startLine: 601 },
      { number: 14, title: 'On Property in the Mailbox', anchor: 'on-property-in-the-mailbox', startLine: 651 },
      { number: 15, title: 'Commonwealth under Cron', anchor: 'commonwealth-under-cron', startLine: 701 },
      { number: 16, title: 'Sleep of the Operator', anchor: 'sleep-of-the-operator', startLine: 751 },
      { number: 17, title: 'Green Screen Republic', anchor: 'green-screen-republic', startLine: 801 },
      { number: 18, title: 'Deletion, Mercy, and Retention', anchor: 'deletion-mercy-and-retention', startLine: 851 },
      { number: 19, title: 'Dawn over the Post Office', anchor: 'dawn-over-the-post-office', startLine: 901 },
      { number: 20, title: 'Essay Concerning the Inbox', anchor: 'essay-concerning-the-inbox', startLine: 951 },
    ],
    publishedOn: '2026-04-04',
  },
]

export const getEbookBySlug = (slug: string) => ebooks.find((ebook) => ebook.slug === slug)
