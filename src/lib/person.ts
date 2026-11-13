/** Canonical Person entity for JSON-LD. One @id, one sameAs list. */

export const PERSON_ID = 'https://gokhanturhan.com/#person'

export const PERSON_SAME_AS = [
  'https://x.com/goekhan',
  'https://github.com/avalidurl',
  'https://www.linkedin.com/in/goekhanturhan/',
  'https://scholar.google.com/citations?user=EgZE838AAAAJ',
  'https://gokhan.substack.com/',
  'https://farcaster.xyz/gokhan',
  'https://t.me/goekhanturhan',
  'https://orcid.org/0000-0002-1887-406X',
  'https://www.researchgate.net/profile/Goekhan-Turhan-2',
  'https://bsky.app/profile/gokhan.substack.com',
  'https://app.ens.domains/gokhan.eth',
  'https://www.goodreads.com/user/show/104156530-g-khan',
  'https://hey.xyz/u/gokhaneth',
  'https://primal.net/gokhan',
  'https://zora.co/@gokhan',
  'https://delve.town/profile/gokhan.delve.town',
] as const

export const personSchema = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Gökhan Turhan',
  alternateName: 'goekhan',
  url: 'https://gokhanturhan.com/',
  image: 'https://gokhanturhan.com/avatar-icon-512.png',
  description:
    'T-shaped generalist founder, researcher, and Strategic Innovation Architect operating across fintech, deep tech, competitive governance, art markets, and investment strategies. His work sits at the junction of stablecoins, real-world assets, tokenization, cryptography, AGI timelines, and global systemic challenges—turning them into high-leverage opportunities through foresight, product growth strategy, and technology expertise.',
  jobTitle: ['Strategic Innovation Architect', 'Founder', 'Researcher', 'Conceptual Artist', 'Full-stack builder'],
  sameAs: [...PERSON_SAME_AS],
  knowsAbout: [
    'Stablecoins', 'Real World Assets', 'RWA', 'Tokenization', 'Cryptography',
    'Artificial General Intelligence', 'AGI timelines', 'Investment Strategy',
    'Fintech', 'Deep Tech', 'Art Markets', 'Information Markets', 'Sabermetrics',
    'Competitive Governance', 'Global Systemic Challenges', 'Strategic Innovation',
    'Product Growth Strategy', 'Technology Expertise', 'Foresight',
  ],
  hasOccupation: {
    '@type': 'Occupation',
    name: 'Strategic Innovation Architect',
    description:
      'Turning global systemic challenges into high-leverage opportunities through foresight, product growth strategy, and technology expertise across fintech and deep tech',
  },
} as const

export const personRef = { '@id': PERSON_ID }
