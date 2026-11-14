/** About: one page per Diátaxis item. Steps are HTML (authored here) and link only to pages that exist. */
export type Quad = 'tutorials' | 'how-to' | 'explanation' | 'reference'
export interface Guide {
  slug: string
  quad: Quad
  title: string
  lead: string
  tags?: string[]
  /** Numbered steps (tutorials, how-to) or paragraphs (explanation). */
  steps?: string[]
  /** Reference rows: [label, value-html]. */
  rows?: [string, string][]
  /** A box of caveats or "if this goes wrong". */
  notes?: string[]
  next: { label: string; href: string }[]
}

export const QUADS: { key: Quad; title: string; mode: string }[] = [
  { key: 'tutorials', title: 'Tutorials', mode: 'learning · do this with me' },
  { key: 'how-to', title: 'How-to guides', mode: 'tasks · help me do this' },
  { key: 'explanation', title: 'Explanation', mode: 'understanding · tell me about it' },
  { key: 'reference', title: 'Reference', mode: 'information · give me the facts' },
]

export const guides: Guide[] = [
  // ---------- Tutorials ----------
  {
    slug: 'read-the-site', quad: 'tutorials', title: 'Read the site in ten minutes',
    lead: 'A first walk through the site, in the order most people find useful.',
    steps: [
      'Open the <a href="/">home page</a>. It is a register: one boxed section each for products, new work and the latest journal posts. Every name in a box opens that item’s own page; CV, Journal, Publishing, Raises and Agents each have their own page in the top bar.',
      'Go to <a href="/products/">Products</a>. The five main products come first: <a href="/ubu/">UBU</a>, <a href="/ishtar/">Ishtar</a>, <a href="/curb/">CURB</a>, <a href="/reclaim/">Reclaim</a> and <a href="/plaintext/">plaintext</a>. Product families follow, and hobby projects come last.',
      'Open <a href="/ubu/">UBU</a>. Open the File strip under the title to see its address, its former address (plain text), its models and datasets. The <a href="/ubu/reader/">Bureau Reader</a> is linked under Read, and the whole book downloads from the reader page as one PDF or EPUB.',
      'Click a tag chip, for example <a href="/archive/tags/agents/">agents</a>. A tag page gathers products, journal posts, drafts, tools and APIs that share it.',
      'Open the <a href="/journal/">Journal</a> and read one post. The subscribe box is at the top of the journal and at the end of every post.',
      'Finish on the <a href="/cv/">CV</a>. The PDF button is at the top, and <a href="/cv.md">cv.md</a> is the same CV as Markdown.',
    ],
    next: [{ label: 'Find an old project', href: '/about/find-an-old-project/' }, { label: 'How the products are organised', href: '/about/how-products-are-organised/' }],
  },
  {
    slug: 'first-agent-read', quad: 'tutorials', title: 'Your first agent read',
    lead: 'Point an agent or a script at the plain-text files this site publishes for machines. Everything here is a static file; nothing needs a key.',
    steps: [
      'Fetch the summary: <code>curl https://gokhanturhan.com/llms.txt</code>. It lists the main products, drafts, publishing, the API index and recent posts, each with a link. <a href="/llms.txt">Open llms.txt</a>.',
      'For the long version, fetch <a href="/llms-full.txt">llms-full.txt</a>. It adds product notes, every journal post with its description, and the whole CV.',
      'Read the CV as Markdown: <code>curl https://gokhanturhan.com/cv.md</code> (<a href="/cv.md">cv.md</a>). <a href="/cv.json">cv.json</a> holds the same data as JSON.',
      'Read the API register: <a href="/api/apis.json">apis.json</a> lists every API the products ran, with its status and its documentation page. It is documentation only: do not call or pay the retired endpoints it lists.',
      'Follow new posts with the feed: <a href="/rss.xml">rss.xml</a>.',
    ],
    notes: ['The site is static. There is no search API; use <a href="/sitemap-index.xml">the sitemap</a> to list every public page.'],
    next: [{ label: 'Feeds and files', href: '/about/feeds-and-files/' }, { label: 'API index', href: '/api/' }],
  },

  // ---------- How-to ----------
  {
    slug: 'subscribe', quad: 'how-to', title: 'Follow the journal',
    lead: 'The email list is offline. The journal stays on this site, and RSS is how to follow it.',
    steps: [
      'Open the <a href="/journal/">Journal</a>. New posts are on that page.',
      'Follow them in a reader: <a href="/rss.xml">rss.xml</a>. The steps are in <a href="/about/follow-by-rss/">Follow by RSS</a>.',
    ],
    notes: [
      'The old email and XMTP list ran on feedhub. That service is offline, and the repository stays public to fork.',
    ],
    next: [{ label: 'Follow by RSS', href: '/about/follow-by-rss/' }, { label: 'Journal', href: '/journal/' }],
  },
  {
    slug: 'unsubscribe', quad: 'how-to', title: 'The email list is closed',
    lead: 'The newsletter service is offline, so it sends nothing further.',
    tags: ['newsletter'],
    steps: [
      'No new list mail will be sent. An unsubscribe link in an old email no longer reaches a live service.',
      'If a message still arrives, write to <a href="mailto:contact@gokhan.vc?subject=Unsubscribe">contact@gokhan.vc</a> from that address with the subject “Unsubscribe”.',
    ],
    notes: [
      'Follow new posts by <a href="/rss.xml">RSS</a> instead. See <a href="/about/follow-by-rss/">Follow by RSS</a>.',
    ],
    next: [{ label: 'Privacy', href: '/privacy/' }, { label: 'Follow by RSS', href: '/about/follow-by-rss/' }],
  },
  {
    slug: 'follow-by-rss', quad: 'how-to', title: 'Follow by RSS',
    lead: 'One feed covers the whole site: the journal.',
    steps: [
      'Copy the feed address: <code>https://gokhanturhan.com/rss.xml</code> (<a href="/rss.xml">open it</a>).',
      'In your feed reader, choose <b>Add feed</b> or <b>Subscribe</b> and paste the address. Most readers also find it from <code>https://gokhanturhan.com/</code>, because every page advertises it.',
      'Each item links to the post at <code>gokhanturhan.com/journal/&lt;slug&gt;/</code>, with its date, description and tags.',
    ],
    notes: ['Older product sites had their own feeds. Those products are now pages here, and this is the one feed to follow.'],
    next: [{ label: 'Journal', href: '/journal/' }, { label: 'Feeds and files', href: '/about/feeds-and-files/' }],
  },
  {
    slug: 'find-an-old-project', quad: 'how-to', title: 'Find an old project',
    lead: 'Every product, draft and experiment now has a page under gokhanturhan.com, even if you knew it by an older address.',
    steps: [
      'Open <a href="/products/">Products</a> and search the page (Ctrl+F or ⌘F) for the old name or the old address. Each row shows the new address and, in italics, the former one.',
      'Not there? Try <a href="/product-drafts/">Drafts</a>. Experiments first published on GitHub Pages are listed there, each with its own page.',
      'Know the topic but not the name? Open <a href="/archive/tags/">Tags</a> and pick one, for example <a href="/archive/tags/agents/">agents</a> or <a href="/archive/tags/token/">token</a>.',
      'Looking for an API rather than a page? The <a href="/api/">API index</a> lists each interface with its former base and a link to its product page.',
      'On a product page, the File strip under the title gives the address to use from now on. Use that link when you cite or share it.',
    ],
    next: [{ label: 'Why addresses moved', href: '/about/why-addresses-moved/' }, { label: 'Cite or link a page', href: '/about/cite-a-page/' }],
  },
  {
    slug: 'cite-a-page', quad: 'how-to', title: 'Cite or link a page',
    lead: 'Every page has a stable address and a document number in its header strip.',
    steps: [
      'Use the address in the browser bar, with its trailing slash, for example <code>https://gokhanturhan.com/ubu/</code>. Product pages also print it in their File strip as <b>Address</b>.',
      'The header strip shows a document number such as <b>MX-010</b>. Add it to a citation if you want a short handle.',
      'For a journal post, cite the author (Gökhan Turhan), the title, the date shown on the post, and its address.',
      'For papers and books, open the item’s own page from <a href="/publishing/">Publishing</a>: <a href="/publishing/academic/">Academic</a>, <a href="/publishing/ebooks/">E-books</a> or <a href="/publishing/experimental/">Experimental</a>.',
      'For a formal CV reference, link the <a href="/cv/">CV</a> or its PDF.',
    ],
    notes: ['Do not cite a former address (numetal.xyz, gokhan.vc and their subdomains). Use the gokhanturhan.com page instead.'],
    next: [{ label: 'Publishing', href: '/publishing/' }, { label: 'Find an old project', href: '/about/find-an-old-project/' }],
  },
  {
    slug: 'get-the-cv', quad: 'how-to', title: 'Get the CV',
    lead: 'The CV comes in four forms, all built from the same data.',
    steps: [
      'Read it on the page: <a href="/cv/">gokhanturhan.com/cv/</a>.',
      'Download the PDF with the <b>PDF</b> button at the top of the CV page, or directly: <a href="/cv/Gokhan_Turhan_CV.pdf">Gokhan_Turhan_CV.pdf</a>.',
      'For an agent or a parser, use <a href="/cv.md">cv.md</a> (Markdown), <a href="/cv.json">cv.json</a> (JSON) or <a href="/cv/plain.txt">plain.txt</a>.',
    ],
    next: [{ label: 'Contact', href: '/about/contact/' }, { label: 'CV', href: '/cv/' }],
  },
  {
    slug: 'contact', quad: 'how-to', title: 'Get in touch',
    lead: 'Email Gökhan Turhan at contact@gokhan.vc, or send a DM: DMs are open on X, LinkedIn and Telegram.',
    steps: [
      'Email: <a href="mailto:contact@gokhan.vc">contact@gokhan.vc</a>. One address for everything: questions, press, collaboration and pitches.',
      'DMs are open. Message <a href="https://x.com/goekhan">@goekhan on X</a>, <a href="https://www.linkedin.com/in/goekhanturhan/">Gökhan Turhan on LinkedIn</a> or <a href="https://t.me/goekhanturhan">@goekhanturhan on Telegram</a>.',
      'Pitches and investment questions go to the same address. <a href="/raises/">Raises</a> shows what is open.',
    ],
    rows: [
      ['Email', '<a href="mailto:contact@gokhan.vc">contact@gokhan.vc</a>'],
      ['LinkedIn', '<a href="https://www.linkedin.com/in/goekhanturhan/">linkedin.com/in/goekhanturhan</a> · DMs open'],
      ['X', '<a href="https://x.com/goekhan">@goekhan</a> · DMs open'],
      ['Telegram', '<a href="https://t.me/goekhanturhan">@goekhanturhan</a> · DMs open'],
    ],
    next: [{ label: 'CV', href: '/cv/' }, { label: 'Products', href: '/products/' }],
  },
  {
    slug: 'read-the-legal-pages', quad: 'how-to', title: 'Read the legal pages',
    lead: 'Site-wide terms sit in the footer. Each product kept its own legal copies, as they were published.',
    steps: [
      'For this site: <a href="/privacy/">Privacy</a> (including analytics and opt-out) and <a href="/disclaimer/">Disclaimer</a>.',
      'For a product, open its legal index: <a href="/ishtar/legal/terms-of-service/">Ishtar terms</a>, <a href="/numetal/legal/terms/">Numetal terms</a>, <a href="/gokhan-vc/legal/terms/">Gökhan Ventures terms</a> or <a href="/agentbounty/legal/">AgentBounty legal</a>.',
      'Each product legal page is an archived copy. Its box shows the address and the former address it was published at.',
    ],
    next: [{ label: 'Unsubscribe', href: '/about/unsubscribe/' }, { label: 'Products', href: '/products/' }],
  },

  // ---------- Explanation ----------
  {
    slug: 'what-this-site-is', quad: 'explanation', title: 'What this site is',
    lead: 'One person’s register: writing, products, publishing and CV in one place.',
    steps: [
      'gokhanturhan.com is the single home for the work of Gökhan Turhan. The journal holds essays and notes going back to 2020. The products are the things built along the way, each with its own page. Publishing collects books, papers and experimental works. The CV ties it together.',
      'The products used to live on their own domains under numetal.xyz and gokhan.vc. They now live here, at gokhanturhan.com/&lt;name&gt;/, and the old domains are being mapped to these pages.',
      'Private tools, such as the reader and the admin consoles, are listed on <a href="/tools/">Tools</a> by what they do. They are not linked, because they sit behind sign-in.',
    ],
    next: [{ label: 'How the products are organised', href: '/about/how-products-are-organised/' }, { label: 'Read the site in ten minutes', href: '/about/read-the-site/' }],
  },
  {
    slug: 'how-products-are-organised', quad: 'explanation', title: 'How the products are organised',
    lead: 'Products, drafts, tools and APIs are four lists from one register, joined by shared tags.',
    steps: [
      '<a href="/products/">Products</a> opens with the five main products (UBU, Ishtar, CURB, Reclaim, plaintext), then the families they belong to (Numetal, Gökhan Ventures and others), then hobby and personal projects such as dashboards and decks.',
      '<a href="/product-drafts/">Drafts</a> are experiments and early pages that never became products. Each still has its own page with what it was.',
      '<a href="/tools/">Tools</a> are private and described only. The <a href="/api/">API index</a> documents the interfaces the products exposed.',
      'Tags cut across all four lists. A tag such as <a href="/archive/tags/agents/">agents</a> shows every product, post, draft, tool and API that carries it.',
    ],
    next: [{ label: 'Products', href: '/products/' }, { label: 'Tags', href: '/archive/tags/' }],
  },
  {
    slug: 'why-addresses-moved', quad: 'explanation', title: 'Why addresses moved',
    lead: 'Everything now lives under gokhanturhan.com; older domains only point here.',
    steps: [
      'Running a domain per product meant many hosts to keep alive. Moving every product to gokhanturhan.com/&lt;name&gt;/ keeps one address to remember and one place to maintain.',
      'Each page keeps its history: the File strip shows the former address as plain text, so you can recognise it, but every link goes to the new page.',
      'Interfaces that were live APIs are documented in the <a href="/api/">API index</a> rather than kept running.',
    ],
    next: [{ label: 'Find an old project', href: '/about/find-an-old-project/' }, { label: 'Products', href: '/products/' }],
  },
  {
    slug: 'design-notes', quad: 'explanation', title: 'Design notes',
    lead: 'The site is set like a register sheet: boxed sections, document numbers, monochrome with one blue for links.',
    steps: [
      'Every section is a box with a black label strip. The strip names the box on the left, says what it holds in grey, and gives a count on the right.',
      'Rows inside a box are separated by dotted rules. The left column is the field name, the right column is the value.',
      'Tags are small outlined chips. Links are blue; everything else is ink on paper. Former addresses are grey plain text.',
      'Each page has a document number in its header strip (MX-…), so it can be referred to briefly.',
    ],
    next: [{ label: 'Colophon', href: '/about/colophon/' }, { label: 'Home', href: '/' }],
  },

  // ---------- Reference ----------
  {
    slug: 'site-sections', quad: 'reference', title: 'Site sections',
    lead: 'Every top-level section and what it holds.',
    rows: [
      ['Home', '<a href="/">/</a> — the register: products, journal, publishing, CV'],
      ['Products', '<a href="/products/">/products/</a> — main products, families, hobby projects'],
      ['Drafts', '<a href="/product-drafts/">/product-drafts/</a> — experiments and early pages'],
      ['Journal', '<a href="/journal/">/journal/</a> — every post, newest first'],
      ['Publishing', '<a href="/publishing/">/publishing/</a> — e-books, academic, experimental'],
      ['CV', '<a href="/cv/">/cv/</a> — with PDF, Markdown and JSON'],
      ['Tags', '<a href="/archive/tags/">/archive/tags/</a> — shared tags across everything'],
      ['Tools', '<a href="/tools/">/tools/</a> — private tools, described only'],
      ['APIs', '<a href="/api/">/api/</a> — documentation of former product APIs'],
      ['About', '<a href="/about/">/about/</a> — these guides'],
    ],
    next: [{ label: 'Feeds and files', href: '/about/feeds-and-files/' }],
  },
  {
    slug: 'feeds-and-files', quad: 'reference', title: 'Feeds and files',
    lead: 'Machine-readable files published by this site.',
    rows: [
      ['RSS', '<a href="/rss.xml">/rss.xml</a> — the journal; the one feed for this site'],
      ['Sitemap', '<a href="/sitemap-index.xml">/sitemap-index.xml</a> — every public, indexable page'],
      ['robots.txt', '<a href="/robots.txt">/robots.txt</a> — crawl rules; points at the sitemap'],
      ['llms.txt', '<a href="/llms.txt">/llms.txt</a> — summary for agents'],
      ['llms-full.txt', '<a href="/llms-full.txt">/llms-full.txt</a> — summary, every post, the CV'],
      ['CV', '<a href="/cv.md">/cv.md</a> · <a href="/cv.json">/cv.json</a> · <a href="/cv/plain.txt">/cv/plain.txt</a>'],
      ['APIs', '<a href="/api/apis.json">/api/apis.json</a> · <a href="/api/openapi.json">/api/openapi.json</a> · <a href="/api/llms.txt">/api/llms.txt</a>'],
    ],
    next: [{ label: 'Your first agent read', href: '/about/first-agent-read/' }],
  },
  {
    slug: 'newsletter-reference', quad: 'reference', title: 'Newsletter',
    lead: 'The email and XMTP list is offline.',
    tags: ['newsletter'],
    rows: [
      ['Status', 'offline'],
      ['Follow', '<a href="/rss.xml">RSS</a> · <a href="/about/follow-by-rss/">how to follow</a>'],
      ['Record', '<a href="/api/newsletter/">Newsletter API page</a>, marked retired'],
    ],
    next: [{ label: 'Follow the journal', href: '/about/subscribe/' }, { label: 'Privacy', href: '/privacy/' }],
  },
  {
    slug: 'colophon', quad: 'reference', title: 'Colophon',
    lead: 'How the site is built.',
    rows: [
      ['Framework', 'Astro, static output'],
      ['Hosting', 'Cloudflare Pages'],
      ['Source', '<a href="https://github.com/avalidurl/gokhan-memex">github.com/avalidurl/gokhan-memex</a>'],
      ['Analytics', 'Google Analytics, with an opt-out on every page; see <a href="/privacy/">Privacy</a>'],
      ['Offline', 'a service worker keeps recently read posts available offline'],
    ],
    next: [{ label: 'Design notes', href: '/about/design-notes/' }],
  },
]

export const guideBySlug = (s: string) => guides.find((g) => g.slug === s)
