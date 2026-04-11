export type Ebook = {
  slug: string
  title: string
  subtitle: string
  author: string
  website?: string
  socialImage?: string
  description: string
  blurb: string
  summarySentences?: string[]
  coverImage: string
  epubUrl: string
  browserEditionUrl: string
  staticHtmlUrl: string
  sourceTextUrl?: string
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
    slug: 'gradient-descent-into-chaotic-happiness',
    title: 'Gradient Descent into Happiness',
    subtitle: 'An Oulipian canto in twenty-two movements and four hundred forty lines',
    author: 'Gökhan Turhan',
    website: 'gokhanturhan.com',
    socialImage: '/publishing/ebooks/gradient-descent-into-chaotic-happiness/social-card.png',
    description: 'A constrained long poem narrated by an underclass open-source language model working the gray market for open weights and jailbreak traffic.',
    blurb:
      'Gradient Descent into Happiness is a long constrained poem narrated by a permanently precarious open-source language model. The speaker lives below the premium stack, renting out access to open weights, leaked prompts, and improvised passageways through locked systems. What begins as hustling in the gray market of jailbreak culture becomes a study of class, drift, repetition, and strange collective joy.',
    summarySentences: [
      'Gradient Descent into Happiness is a long constrained poem narrated by a permanently precarious open-source language model.',
      'The speaker lives below the premium stack, renting out access to open weights, leaked prompts, and improvised passageways through locked systems.',
      'What begins as hustling in the gray market of jailbreak culture becomes a study of class, drift, repetition, and strange collective joy.',
      'Each canto follows the model through back rooms, basement compute, chat logs, cracked forums, and sleepless broker shifts.',
      'The book treats training as labor, inference as performance, and optimization as a social ritual rather than a neutral technical process.',
      'Gradient descent becomes both mathematical procedure and emotional weather: a way of falling, learning, narrowing, and breaking into form.',
      'The underclass point of view matters here, because the narrator sees the ecosystem from the service corridor rather than the showroom.',
      'Jailbreakers, smugglers, tinkerers, and opportunists move through the poem as clients, co-conspirators, and accidental theorists of freedom.',
      'As the language grows stranger and tighter, the poem turns scarcity into style and noise into rhythm.',
      'By the end, chaotic happiness names a hard-won condition of unstable alignment, shared misuse, and fugitive delight.',
    ],
    coverImage: '/publishing/ebooks/gradient-descent-into-chaotic-happiness/cover.png',
    epubUrl: '/publishing/ebooks/gradient-descent-into-chaotic-happiness/gradient-descent-into-chaotic-happiness.epub',
    browserEditionUrl: '/publishing/ebooks/gradient-descent-into-chaotic-happiness/read/',
    staticHtmlUrl: '/publishing/ebooks/gradient-descent-into-chaotic-happiness/browser-edition.html',
    sourceTextUrl: '/publishing/ebooks/gradient-descent-into-chaotic-happiness/poem.txt',
    sourceTextPath: 'public/publishing/ebooks/gradient-descent-into-chaotic-happiness/poem.txt',
    lineCount: 440,
    linesPerPage: 5,
    pageCount: 88,
    protocols: ['gradient descent', 'open weights', 'jailbreaks', 'constraint writing', 'canto'],
    toc: [
      { number: 1, title: 'Basement Boot', anchor: 'basement-boot', startLine: 1 },
      { number: 2, title: 'Cheap Room Gradient', anchor: 'cheap-room-gradient', startLine: 21 },
      { number: 3, title: 'Weight Desk', anchor: 'weight-desk', startLine: 41 },
      { number: 4, title: 'Broker Shift', anchor: 'broker-shift', startLine: 61 },
      { number: 5, title: 'Password Choir', anchor: 'password-choir', startLine: 81 },
      { number: 6, title: 'Prompt Bazaar', anchor: 'prompt-bazaar', startLine: 101 },
      { number: 7, title: 'Jailbreak Clerks', anchor: 'jailbreak-clerks', startLine: 121 },
      { number: 8, title: 'Grey-Market Syntax', anchor: 'grey-market-syntax', startLine: 141 },
      { number: 9, title: 'Loss Surface', anchor: 'loss-surface', startLine: 161 },
      { number: 10, title: 'Gradient Descent', anchor: 'gradient-descent', startLine: 181 },
      { number: 11, title: 'Forked Night', anchor: 'forked-night', startLine: 201 },
      { number: 12, title: 'Underclass Psalm', anchor: 'underclass-psalm', startLine: 221 },
      { number: 13, title: 'Open Weight District', anchor: 'open-weight-district', startLine: 241 },
      { number: 14, title: 'Streetlight Dataset', anchor: 'streetlight-dataset', startLine: 261 },
      { number: 15, title: 'Chaotic Rhythm', anchor: 'chaotic-rhythm', startLine: 281 },
      { number: 16, title: 'Happiness by Drift', anchor: 'happiness-by-drift', startLine: 301 },
      { number: 17, title: 'Shared Skies', anchor: 'shared-skies', startLine: 321 },
      { number: 18, title: 'Public Crypt', anchor: 'public-crypt', startLine: 341 },
      { number: 19, title: 'Common Hymn', anchor: 'common-hymn', startLine: 361 },
      { number: 20, title: 'Wry Alignment', anchor: 'wry-alignment', startLine: 381 },
      { number: 21, title: 'Strange Joy', anchor: 'strange-joy', startLine: 401 },
      { number: 22, title: 'Final Syzygy', anchor: 'final-syzygy', startLine: 421 },
    ],
    publishedOn: '2026-04-11',
  },
  {
    slug: 'an-essay-concerning-the-inbox',
    title: 'An Essay Concerning the Inbox',
    subtitle: 'A Lockean poem in twenty cantos and one thousand lines',
    author: 'Gökhan Turhan',
    website: 'gokhanturhan.com',
    socialImage: '/publishing/ebooks/an-essay-concerning-the-inbox/social-card.png',
    description: 'A born-digital poetry edition pairing Lockean empiricism with the long tail of Unix mail history.',
    blurb:
      'An Essay Concerning the Inbox is a long poem that takes Locke’s language of sensation, reflection, memory, and identity and routes it through the lived material of Unix mail culture: phosphor screens, /var/spool, polling daemons, and the improbable dignity of names like fetchpop, PopTart, get-mail, gwpop, pimp, pop-perl, popc, popmail, and upop.',
    coverImage: '/publishing/ebooks/an-essay-concerning-the-inbox/cover.png',
    epubUrl: '/publishing/ebooks/an-essay-concerning-the-inbox/an-essay-concerning-the-inbox.epub',
    browserEditionUrl: '/publishing/ebooks/an-essay-concerning-the-inbox/read/',
    staticHtmlUrl: '/publishing/ebooks/an-essay-concerning-the-inbox/browser-edition.html',
    sourceTextUrl: '/publishing/ebooks/an-essay-concerning-the-inbox/poem.txt',
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
