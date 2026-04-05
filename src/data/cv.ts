/**
 * Canonical CV content (aligned with public/cv/Gokhan_Turhan_CV.pdf).
 * Used for HTML page, plain text, JSON, and raw HTML exports.
 */

export const cvMeta = {
  name: 'Gökhan Turhan',
  title: 'Full-spectrum growth operator',
  tagline:
    'Full-spectrum growth operator across fintech infrastructure, AI-native tooling, and tokenized markets. Builds websites, prototypes, content, and growth engines, with code, not just slide decks.',
  pdfUrl: '/cv/Gokhan_Turhan_CV.pdf',
  pdfFileName: 'Gokhan_Turhan_CV.pdf',
  lastUpdated: '2026-03-02',
} as const

export type ContactLine = { label: string; value: string; url?: string }

export const contact: ContactLine[] = [
  { label: 'Location', value: 'İstanbul, Türkiye' },
  { label: 'Email', value: 'gokhan@gokhanturhan.com', url: 'mailto:gokhan@gokhanturhan.com' },
  { label: 'Website', value: 'gokhanturhan.com', url: 'https://gokhanturhan.com/' },
  { label: 'LinkedIn', value: 'linkedin.com/in/goekhanturhan', url: 'https://linkedin.com/in/goekhanturhan' },
  { label: 'X', value: 'x.com/goekhan', url: 'https://x.com/goekhan' },
  { label: 'GitHub', value: 'github.com/avalidurl', url: 'https://github.com/avalidurl' },
  { label: 'Substack', value: 'gokhan.substack.com', url: 'https://gokhan.substack.com/' },
]

export const profile = [
  `Growth and business development operator focused on building growth engines that compound distribution, conversion, and revenue. I run end-to-end systems across performance marketing, partnership development, CRM orchestration, and experimentation to move quickly from strategy to measurable outcomes.`,
  `My operating model blends AI-native execution with channel-specific creative, analytics instrumentation, and rapid iteration loops across paid, owned, and earned media. I specialize in memetic viral social engineering: message architecture, platform-native storytelling, and feedback-driven campaign scaling that improves both reach and unit economics.`,
  `I am proactive by default, with taste in art, classical and jazz music, a serious home-chef practice, and a consistent training-and-sports discipline.`,
]

export type CVExperience = {
  role: string
  org: string
  location?: string
  start: string
  end: string
  bullets: string[]
}

export const experience: CVExperience[] = [
  {
    role: 'Head of Growth & Marketing',
    org: 'Kingpost.io + Quake Cash',
    start: 'Sep 2024',
    end: 'Aug 2025',
    bullets: [
      'Led growth strategy across a hybrid fintech product spanning custodial RWA issuance and DeFi-native perpetual markets.',
      'Built GTM positioning, CRM pipelines (HubSpot), partnership funnels, and content-driven acquisition using AI-assisted workflows.',
      'Operated across product, BD, marketing, and social media, connective tissue between technical teams and market execution.',
      'Prototyped internal tools, landing pages, and documentation using Claude Code, Cursor, and Figma.',
    ],
  },
  {
    role: 'Independent Researcher & Advisor',
    org: 'Freelance',
    location: 'İstanbul',
    start: 'Jan 2020',
    end: 'Oct 2024',
    bullets: [
      'Published research on DeFi protocol mechanics, tokenization frameworks, and distributed systems governance.',
      'Advisory engagements across fintech and deep-tech verticals on product positioning, org design, and market entry.',
      'Technical copywriting, documentation, and newsletter production for protocol and infrastructure clients.',
    ],
  },
  {
    role: 'Content Specialist & Client Success',
    org: 'GoDaddy Türkiye (via Artı İletişim) & MCAN Health',
    location: 'İstanbul',
    start: '2019',
    end: '2020',
    bullets: [
      'Content strategy, copywriting, and customer success across health tourism and domain services markets.',
    ],
  },
  {
    role: 'NGO Volunteer & Contributor',
    org: "Helsinki Citizens' Assembly",
    location: 'İstanbul',
    start: '2009',
    end: '2017',
    bullets: [
      'Long-term civic engagement in human rights advocacy, cross-cultural dialogue, and community organizing.',
    ],
  },
  {
    role: 'English Language Instructor',
    org: 'İstanbul Nişantaşı Üniversitesi & Çanakkale 18 Mart Üniversitesi',
    start: '2013',
    end: '2016',
    bullets: [
      'University-level EFL/ESL instruction; curriculum development and cross-cultural communication.',
    ],
  },
]

export const education = [
  {
    degree: 'M.A. Comparative Literature',
    honors: 'Top of Class',
    years: '2014–2017',
    school: 'İstanbul Bilgi University',
    detail:
      'Thesis: "The Importance and Function of Media Laboratories for the Preservation of Works of Digital and Electronic Literature"',
    link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=EgZE838AAAAJ&citation_for_view=EgZE838AAAAJ:W7OEmFMy1HYC',
    linkLabel: 'Google Scholar',
  },
  {
    degree: 'B.A. American Culture & Literature',
    years: '2006–2012',
    school: 'Bahçeşehir University',
  },
] as const

export const publications = [
  'Published author and exhibited conceptual artist.',
  '"On the Hyperstitional Implications of Memes as Digital Objects in Turkey"',
] as const

export const skillGroups = [
  {
    name: 'AI tooling',
    items: [
      'Code & Dev: ChatGPT / Codex CLI · Claude Code · Cursor · OpenCode · Jules',
      'AI Platforms: Google AI Studio · Hugging Face · Gemini · Grok · Antigravity',
      'Rapid Builders: Lovable · Bolt',
      'Voice & Creative AI: Whispr · Suno',
    ],
  },
  {
    name: 'Fintech domain',
    items: [
      'RWA Tokenization (Custodial & Non-Custodial)',
      'Perpetuals · AMMs · Stablecoins',
      'Hybrid Fintech Architecture',
      'TradingView · PineScript',
    ],
  },
  {
    name: 'Technical literacy',
    items: [
      'Languages (read / review / pair): Solidity · Rust · Python · JavaScript · TypeScript · Ruby on Rails · PineScript',
      'Frameworks & Runtimes: Node.js · React · Next.js · Jupyter Notebook',
      'VMs & Chains: EVM · SVM · BTC Core',
      'Web & Infrastructure: Cloudflare · Vercel · WordPress',
    ],
  },
  {
    name: 'Creative & production',
    items: [
      'Adobe Creative Suite · Figma · Final Cut Pro · CapCut · Logic Pro · Ableton Live',
      'Podcast & Video Production · Conceptual Art Practice',
    ],
  },
  {
    name: 'Growth & operations',
    items: [
      'CRM: HubSpot · Salesforce · Pipedrive · Close · Zoho CRM',
      'Ops & Productivity: Notion · Airtable · Office 365 · Linear',
      'Project Management: Jira · Asana · Monday · Trello · Basecamp',
      'Analytics & Measurement: Mixpanel · Google Analytics · PostHog',
      'Knowledge Systems: Obsidian · Roam Research',
    ],
  },
  {
    name: 'Social & distribution',
    items: [
      'Mainstream: LinkedIn · X · TikTok · Facebook · Instagram',
      'Social Analytics: Circleboom · Sprout',
      'Web3 & Decentralized: Farcaster · Lens · Bluesky',
      'Publishing & Newsletters: Substack · Ghost · Beehiiv · Paragraph',
      'Alt Networks: Truth Social · Gab',
      'Messaging & Email: Telegram · E-mail Marketing',
    ],
  },
  {
    name: 'Writing & content',
    items: [
      'Technical Copywriting · Documentation & API Specs',
      'Newsletters · Blogging · Website Content & SEO',
    ],
  },
] as const

export const languages = [
  { name: 'Turkish', level: 'Native' },
  { name: 'English', level: 'IELTS 8/9' },
  { name: 'Japanese', level: 'Elementary' },
] as const

export function cvPlainText(): string {
  const lines: string[] = []
  const br = () => lines.push('')
  lines.push(cvMeta.name.toUpperCase())
  lines.push(cvMeta.title)
  lines.push(cvMeta.tagline)
  br()
  lines.push('CONTACT')
  for (const c of contact) {
    lines.push(c.url ? `${c.label}: ${c.value} (${c.url})` : `${c.label}: ${c.value}`)
  }
  br()
  lines.push('PROFILE')
  for (const p of profile) {
    lines.push(p)
    br()
  }
  lines.push('EXPERIENCE')
  for (const job of experience) {
    lines.push(`${job.role} — ${job.org}${job.location ? `, ${job.location}` : ''}`)
    lines.push(`${job.start} – ${job.end}`)
    for (const b of job.bullets) {
      lines.push(`• ${b}`)
    }
    br()
  }
  lines.push('EDUCATION')
  for (const ed of education) {
    lines.push(`${ed.degree}${'honors' in ed && ed.honors ? ` — ${ed.honors}` : ''} — ${ed.school} (${ed.years})`)
    if ('detail' in ed && ed.detail) lines.push(ed.detail)
    if ('link' in ed && ed.link) lines.push(`${ed.linkLabel ?? 'Link'}: ${ed.link}`)
    br()
  }
  lines.push('PUBLICATIONS & EXHIBITIONS')
  for (const pub of publications) lines.push(pub)
  br()
  lines.push('SKILLS')
  for (const g of skillGroups) {
    lines.push(`[${g.name}]`)
    for (const item of g.items) lines.push(`- ${item}`)
    br()
  }
  lines.push('LANGUAGES')
  for (const l of languages) lines.push(`${l.name}: ${l.level}`)
  br()
  lines.push(`PDF: https://gokhanturhan.com${cvMeta.pdfUrl}`)
  lines.push(`Last updated: ${cvMeta.lastUpdated}`)
  return lines.join('\n').trim() + '\n'
}

export function cvJsonLd(site: URL) {
  const sameAs = contact
    .filter((c) => c.url && c.url.startsWith('http'))
    .map((c) => c.url as string)

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: cvMeta.name,
    url: new URL('/cv/', site).href,
    email: 'gokhan@gokhanturhan.com',
    jobTitle: cvMeta.title,
    description: cvMeta.tagline,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'İstanbul',
      addressCountry: 'TR',
    },
    sameAs,
    knowsAbout: skillGroups.flatMap((g) => g.items),
    alumniOf: education.map((e) => ({
      '@type': 'EducationalOrganization',
      name: e.school,
    })),
    workExample: [{ '@type': 'CreativeWork', name: publications[1] }],
  }
}

/** Flat JSON resume for agents and ATS-style parsers */
export function cvStructuredJson(site: URL) {
  return {
    version: '1.0',
    updated: cvMeta.lastUpdated,
    person: {
      name: cvMeta.name,
      title: cvMeta.title,
      tagline: cvMeta.tagline,
      contact: Object.fromEntries(
        contact.map((c) => [c.label.toLowerCase().replace(/\s+/g, '_'), c.url ?? c.value])
      ),
    },
    profile,
    experience: experience.map((e) => ({
      role: e.role,
      organization: e.org,
      location: e.location,
      start: e.start,
      end: e.end,
      highlights: e.bullets,
    })),
    education: education.map((e) => ({ ...e })),
    publications: [...publications],
    skills: skillGroups.map((g) => ({ category: g.name, items: [...g.items] })),
    languages: [...languages],
    documents: {
      html: new URL('/cv/', site).href,
      pdf: new URL(cvMeta.pdfUrl, site).href,
      plainText: new URL('/cv/plain.txt', site).href,
      rawHtml: new URL('/cv/raw.html', site).href,
      json: new URL('/cv.json', site).href,
    },
  }
}

export function cvRawHtmlDocument(site: URL): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  const parts: string[] = []
  parts.push(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/>`)
  parts.push(`<meta name="viewport" content="width=device-width, initial-scale=1"/>`)
  parts.push(`<title>${esc(cvMeta.name)} — CV</title>`)
  parts.push(`<meta name="description" content="${esc(cvMeta.tagline)}"/>`)
  parts.push(`<link rel="canonical" href="${esc(new URL('/cv/', site).href)}"/>`)
  parts.push(`</head><body><article>`)
  parts.push(`<h1>${esc(cvMeta.name)}</h1><p><strong>${esc(cvMeta.title)}</strong></p>`)
  parts.push(`<p>${esc(cvMeta.tagline)}</p>`)
  parts.push(`<h2>Contact</h2><ul>`)
  for (const c of contact) {
    if (c.url && c.url.startsWith('http')) {
      parts.push(`<li>${esc(c.label)}: <a href="${esc(c.url)}">${esc(c.value)}</a></li>`)
    } else if (c.url?.startsWith('mailto:')) {
      parts.push(`<li>${esc(c.label)}: <a href="${esc(c.url)}">${esc(c.value)}</a></li>`)
    } else {
      parts.push(`<li>${esc(c.label)}: ${esc(c.value)}</li>`)
    }
  }
  parts.push(`</ul><h2>Profile</h2>`)
  for (const p of profile) parts.push(`<p>${esc(p)}</p>`)
  parts.push(`<h2>Experience</h2>`)
  for (const job of experience) {
    parts.push(
      `<section><h3>${esc(job.role)} — ${esc(job.org)}${job.location ? ` (${esc(job.location)})` : ''}</h3>` +
        `<p><time>${esc(job.start)}</time> – <time>${esc(job.end)}</time></p><ul>`
    )
    for (const b of job.bullets) parts.push(`<li>${esc(b)}</li>`)
    parts.push(`</ul></section>`)
  }
  parts.push(`<h2>Education</h2><ul>`)
  for (const ed of education) {
    parts.push(
      `<li><strong>${esc(ed.degree)}</strong>${'honors' in ed && ed.honors ? ` (${esc(ed.honors)})` : ''}, ${esc(ed.school)} — ${esc(ed.years)}` +
        ('detail' in ed && ed.detail ? `<br/>${esc(ed.detail)}` : '') +
        ('link' in ed && ed.link
          ? `<br/><a href="${esc(ed.link)}">${esc(ed.linkLabel ?? 'Link')}</a>`
          : '') +
        `</li>`
    )
  }
  parts.push(`</ul><h2>Publications &amp; exhibitions</h2><ul>`)
  for (const pub of publications) parts.push(`<li>${esc(pub)}</li>`)
  parts.push(`</ul><h2>Skills</h2>`)
  for (const g of skillGroups) {
    parts.push(`<section><h3>${esc(g.name)}</h3><ul>`)
    for (const item of g.items) parts.push(`<li>${esc(item)}</li>`)
    parts.push(`</ul></section>`)
  }
  parts.push(`<h2>Languages</h2><ul>`)
  for (const l of languages) parts.push(`<li>${esc(l.name)}: ${esc(l.level)}</li>`)
  parts.push(`</ul></article></body></html>`)
  return parts.join('')
}
