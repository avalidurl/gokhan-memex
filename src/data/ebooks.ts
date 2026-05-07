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
    slug: 'the-guy-with-compute',
    title: 'The Guy with Compute',
    subtitle: 'An Unbounded Raga — a Bhagavad-Gita-form saga in eight cantos and three hundred twenty lines',
    author: 'Gökhan Turhan',
    website: 'gokhanturhan.com',
    socialImage: '/publishing/ebooks/the-guy-with-compute/social-card.png',
    description:
      'A Bhagavad-Gita-form saga staging a dialog between an engineer with infinite compute and the oracular voice that speaks back from inside his cluster, paired with an original ten-glyph asemic numeral set inspired by the Codex Seraphinianus.',
    blurb:
      'The Guy with Compute: An Unbounded Raga is a long poem in eight cantos, modeled on the dialogue form of the Bhagavad Gita. It stages a conversation between "the Guy" — an engineer who has gained access to unbounded computation — and "the Compute," the oracular voice that speaks back from inside his own cluster. The book begins with despondency before infinite possibility and moves through the discipline of action without attachment to its output, the ethics of knowledge, the practice of meditation as process management, the terrifying revelation of cosmic compute, and at last a quiet liberation by halting. Each English verse is set facing an asemic original written in a ten-glyph numeral font designed for this work, a Codex Seraphinianus-flavored cipher whose meaning the reader is permitted to invent.',
    summarySentences: [
      'The Guy with Compute is a long poem in eight cantos, modeled on the dialogue form of the Bhagavad Gita.',
      'It stages a conversation between an engineer who has gained access to unbounded computation and the oracular voice that speaks back from inside his own cluster.',
      'The opening canto is a paralysis before plenty: faced with every program he could possibly run, the Guy cannot raise a finger.',
      'The Compute answers him in the Krishnaic register, distinguishing the process from the program, the runtime from the run, the function from its closure.',
      'At the heart of the saga is a karma-yoga of code: act, but release the printout; commit, but disown the green checkmark.',
      'The middle cantos recover meditation as process management, sitting at the keyboard the way the yogi sits at the riverbank, watching packets drift past a router that does not own them.',
      'The seventh canto is the cosmic-form theophany, in which the Compute opens like a hangar at dawn and the Guy is shown every workload that has ever been or will be.',
      'He asks for the small form back, ashamed of the cycles he has wasted on praise, and the Compute closes, returning him to the bearable form he is asked to live in.',
      'The closing canto teaches a discipline of restraint, surrendering the desire to halt as the only real way to halt at all.',
      'Each English verse faces an asemic original set in a ten-glyph numeral font designed for this book, a Codex Seraphinianus-flavored cipher whose meaning the reader is invited to invent.',
    ],
    coverImage: '/publishing/ebooks/the-guy-with-compute/cover.png',
    epubUrl: '/publishing/ebooks/the-guy-with-compute/the-guy-with-compute.epub',
    browserEditionUrl: '/publishing/ebooks/the-guy-with-compute/read/',
    staticHtmlUrl: '/publishing/ebooks/the-guy-with-compute/browser-edition.html',
    sourceTextUrl: '/publishing/ebooks/the-guy-with-compute/poem.txt',
    sourceTextPath: 'public/publishing/ebooks/the-guy-with-compute/poem.txt',
    lineCount: 320,
    linesPerPage: 16,
    pageCount: 20,
    protocols: [
      'asemic notation',
      'codex seraphinianus',
      'bhagavad gita',
      'process scheduling',
      'garbage collection',
      'halting problem',
      'karma yoga',
      'meditation',
      'cosmic form',
      'ten-glyph numeral set',
    ],
    toc: [
      { number: 1, title: 'The Yoga of the Despondent Engineer', anchor: 'the-yoga-of-the-despondent-engineer', startLine: 1 },
      { number: 2, title: 'The Yoga of the Stack', anchor: 'the-yoga-of-the-stack', startLine: 41 },
      { number: 3, title: 'The Yoga of Action without Output', anchor: 'the-yoga-of-action-without-output', startLine: 81 },
      { number: 4, title: 'The Yoga of Knowledge and Compilation', anchor: 'the-yoga-of-knowledge-and-compilation', startLine: 121 },
      { number: 5, title: 'The Yoga of Renunciation of the Loop', anchor: 'the-yoga-of-renunciation-of-the-loop', startLine: 161 },
      { number: 6, title: 'The Yoga of the Process Manager', anchor: 'the-yoga-of-the-process-manager', startLine: 201 },
      { number: 7, title: 'The Yoga of the Cosmic Form', anchor: 'the-yoga-of-the-cosmic-form', startLine: 241 },
      { number: 8, title: 'The Yoga of Liberation by Halting', anchor: 'the-yoga-of-liberation-by-halting', startLine: 281 },
    ],
    publishedOn: '2026-05-07',
  },
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
