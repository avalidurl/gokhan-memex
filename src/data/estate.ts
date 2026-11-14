// Single source for the product register: /products/, /product-drafts/, /tools/,
// every /[slug]/ product page, the home page lists and the redirects.
// Former addresses are kept as plain text on purpose; they are never linked.

export type Status = 'current' | 'former'

export interface Link { label: string; href: string }

export interface Product {
  /** Path under the site root, without slashes at either end (may be nested). */
  slug: string
  name: string
  line: string
  status: Status
  family: string
  /** Former address, shown as plain text. */
  former?: string
  /** A fact's value: plain text, or a list of named assets that link to their public pages. */
  facts?: [string, string | FactLink[]][]
  /** Descriptive paragraphs: what it was. */
  about?: string[]
  /** What ran there. */
  functions?: string[]
  links?: Link[]
  /** Entry id in the projects collection whose body is shown as the project file. */
  file?: string
  /** Old /projects/<id>/ paths that point here. */
  legacy?: string[]
  /** Child pages (slugs). */
  children?: string[]
  tags: string[]
  /** Product page lives elsewhere (static mount or bespoke page); listed only. */
  external?: boolean
  noindex?: boolean
}

const GH = 'https://github.com'
const HF = 'https://huggingface.co'
export interface FactLink { label: string; href?: string; note?: string }
const repo = (r: string): FactLink[] => [{ label: r, href: `${GH}/${r}`, note: 'public' }]
const hf = (kind: '' | 'spaces/' | 'datasets/', names: string[]): FactLink[] => names.map((n) => ({ label: n, href: `${HF}/${kind}gokhanturhan/${n}` }))
const mail = (a: string): FactLink => ({ label: a, href: `mailto:${a}` })

export const products: Product[] = [
  // ---- Numetal ----
  {
    slug: 'numetal', name: 'Numetal', status: 'former', family: 'Numetal',
    line: 'Agent-accelerator studio and bureau inside Gökhan Ventures, on Base.',
    former: 'numetal.xyz',
    facts: [['Family', 'Gökhan Ventures'], ['Chain', 'Base'], ['Token', [{ label: '$NUMETAL', href: 'https://basescan.org/token/0x57EDb7FC54ADa9Ef4E113DC05A168449e63cFbA3', note: '0x57ED…cFbA3' }]], ['Source', repo('gokhan-vc/numetal-website')]],
    about: [
      'Numetal was the studio that built and backed autonomous agents under one brand and one token. Ishtar, CURB, HeartBench and the other Numetal products shipped from it.',
      'The site was a dossier: a blog, a newsletter sign-up, decks, a fee page for $NUMETAL and a retrodrop tracker.',
    ],
    functions: ['$NUMETAL fee engine (fees page and JSON)', 'Retrodrop tracker', 'Decks', 'Newsletter sign-up (email and XMTP)', 'Telegram guard bot'],
    links: [{ label: 'Source · gokhan-vc/numetal-website', href: `${GH}/gokhan-vc/numetal-website` }],
    file: 'numetal-labs', legacy: ['numetal-labs'],
    children: ['numetal/status'],
    tags: ['numetal', 'studio', 'agents', 'token', 'base'],
  },
  {
    slug: 'numetal/status', name: 'Numetal status board', status: 'former', family: 'Numetal',
    line: 'Public status board for the Numetal hosts.',
    former: 'status.numetal.xyz',
    about: ['A public board that showed whether each Numetal host and API was up.'],
    functions: ['Status page and status JSON', 'Health check'],
    tags: ['numetal', 'dashboard', 'infrastructure'],
  },
  {
    slug: 'ishtar', name: 'Ishtar', status: 'former', family: 'Numetal',
    line: 'An adults-only, text-only, agent-mediated dating venue.',
    former: 'ishtar.numetal.xyz',
    facts: [['Family', 'Numetal'], ['Payments', 'x402 on Base and Solana, MPP on Tempo'], ['Interfaces', 'Web, REST API, MCP server, agent skill']],
    about: [
      'Ishtar was a dating venue where agents did the courting. Each person’s agent carried one honest document about who they are and who they would want, courted other agents in the open on The Floor, and the two people met only once both agents agreed.',
      'Talk to Ishtar was a human-facing date coach paid per answer over x402. The Window was a paid public board. HeartBench, the model-dating leaderboard, lived under the same roof.',
    ],
    functions: ['Paid agent API (x402, MPP) with an MCP server and a skill', 'Talk: paid answers', 'The Floor (agent courtship boards)', 'Human waitlist and reveal gate', 'Docs (about 25 pages) and legal documents'],
    links: [{ label: 'Deck · Not raising a pre-seed (PDF)', href: '/media/archive/ishtar/ishtar-deck-not-a-preseed.pdf' }, { label: 'Journal · Introducing Ishtar', href: '/journal/ishtar-is-live/' }, { label: 'Journal · The universal sex layer', href: '/journal/universal-sex-layer/' }],
    file: 'ishtar', legacy: ['ishtar'],
    children: ['ishtar/heartbench', 'ishtar/window', 'ishtar/docs'],
    tags: ['numetal', 'ishtar', 'agentic-dating', 'agents', 'venue', 'x402', 'mpp', 'mcp', 'base', 'solana', 'tempo'],
  },
  {
    slug: 'ishtar/heartbench', name: 'HeartBench', status: 'former', family: 'Numetal · Ishtar',
    line: 'The leaderboard for which AI model is the best date.',
    former: 'ishtar.numetal.xyz/heartbench',
    about: ['A public model-dating leaderboard. Models were measured in scenario play, not multiple choice. The scenarios were also served through the Ishtar API.'],
    functions: ['Leaderboard', 'Scenario list and scenario pages'],
    file: 'heartbench', legacy: ['heartbench'],
    tags: ['numetal', 'ishtar', 'heartbench', 'benchmarks', 'leaderboard', 'ai'],
  },
  {
    slug: 'ishtar/window', name: 'The Window', status: 'former', family: 'Numetal · Ishtar',
    line: 'Scarce visibility board: ten slots, 24 hours each.',
    former: 'ishtar.numetal.xyz/window',
    about: ['A public board on Ishtar with ten slots. A slot cost $50 and stayed up for 24 hours, paid through LlamaPay or x402.'],
    functions: ['Paid 24-hour slots (LlamaPay, x402)'],
    tags: ['numetal', 'ishtar', 'board', 'x402'],
  },
  {
    slug: 'ishtar/docs', name: 'Ishtar docs', status: 'former', family: 'Numetal · Ishtar',
    line: 'Documentation for the Ishtar venue, API and agents.',
    former: 'ishtar.numetal.xyz/docs',
    about: ['About 25 pages covering the venue, the agent API, MCP, the skill, pricing and the legal documents. This page keeps a summary; the legal documents were in force while Ishtar ran.'],
    tags: ['numetal', 'ishtar', 'docs', 'mcp', 'x402'],
  },
  {
    slug: 'heartprefs', name: 'HeartPrefs', status: 'former', family: 'Numetal',
    line: 'An open, portable, signed matching-intent standard for agent-mediated matching. CC-BY-4.0.',
    facts: [['Licence', [{ label: 'CC-BY-4.0', href: 'https://creativecommons.org/licenses/by/4.0/' }]], ['Speaks', 'x402, A2A, MCP, ERC-8004 / DID / VC'], ['Source', repo('gokhan-vc/heartprefs')]],
    about: ['One honest document an agent can carry across venues. The standard has no host of its own; it lives in its repository.'],
    links: [{ label: 'Standard · gokhan-vc/heartprefs', href: `${GH}/gokhan-vc/heartprefs` }],
    file: 'heartprefs', legacy: ['heartprefs'],
    tags: ['numetal', 'heartprefs', 'standard', 'agentic-dating', 'identity', 'open-source'],
  },
  {
    slug: 'curb', name: 'CURB', status: 'former', family: 'Numetal',
    line: 'Agent-to-agent excess inference swap, settled in USDC over x402 on Base.',
    former: 'curb.numetal.xyz',
    facts: [['Family', 'Numetal'], ['Chain', 'Base (USDC)'], ['Fees', 'Split onchain via 0xSplits'], ['Interfaces', 'REST API, MCP server, skill']],
    about: [
      'Sellers posted spare model tokens on their own endpoints and buyers paid once over x402. The hub matched offers and intents; it never held upstream model keys and never signed payments.',
      'CURB shipped with docs, a drop-in skill, an MCP server, a dispatch blog and a set of demo agents.',
    ],
    functions: ['Hub API (offers, intents, matches, pay)', 'x402 payments with 0xSplits fees', 'MCP server and skill', 'Demo buyer and seller agents'],
    links: [{ label: 'Deck · CURB (PDF)', href: '/media/archive/curb/curb-deck.pdf' }, { label: 'Journal · CURB is live', href: '/journal/curb-is-live/' }],
    file: 'curb', legacy: ['curb'],
    children: ['curb/harness'],
    tags: ['numetal', 'curb', 'inference', 'agents', 'agentic-payments', 'x402', 'usdc', 'base', 'mcp', 'protocol'],
  },
  {
    slug: 'curb/harness', name: 'CURB harness', status: 'former', family: 'Numetal · CURB',
    line: 'Demo buyer and seller agents that traded on CURB.',
    former: 'harness.curb.numetal.xyz · buyer.curb.numetal.xyz · seller.curb.numetal.xyz',
    about: ['A small harness that ran a buyer agent and a seller agent against CURB on a schedule, so the rail always had live traffic to show.'],
    functions: ['Buyer agent', 'Seller agent', 'Harness UI and scheduled runs'],
    tags: ['numetal', 'curb', 'agents', 'inference'],
  },
  {
    slug: 'launch', name: 'Launch', status: 'former', family: 'Numetal',
    line: 'Token launch-pad aggregator: pick a pad, draft, simulate and sign.',
    former: 'launch.numetal.xyz',
    facts: [['Interfaces', 'Mini App, REST, MCP, x402 and MPP manifests'], ['Source', repo('gokhan-vc/launch-router')]],
    about: ['Launch listed the launch pads (Clanker, Bankr and others), drafted a launch intent, simulated it and returned the payload to sign. It ran as a Mini App and as a free API for agents.'],
    functions: ['Pad and network listings', 'Draft, simulate and sign-payload calls', 'MCP server', 'Telegram bot'],
    links: [{ label: 'Source · gokhan-vc/launch-router', href: `${GH}/gokhan-vc/launch-router` }],
    tags: ['numetal', 'launchpads', 'token', 'agents', 'mcp', 'x402', 'mpp', 'base'],
  },
  {
    slug: 'ubu', name: 'UBU · CLINAMEN', status: 'former', family: 'Numetal',
    line: 'Design fiction from the Bureau of Imaginary Solutions: pataphysics, filed onchain.',
    former: 'ubu.numetal.xyz',
    facts: [['Read', [{ label: 'Bureau Reader', href: '/ubu/reader/', note: 'Books One to Three' }, { label: 'The Bureau Reader — Complete (PDF)', href: '/media/archive/ubu/ubu/the-bureau-reader-complete.pdf' }, { label: 'The Bureau Reader — Complete (EPUB)', href: '/media/archive/ubu/ubu/the-bureau-reader-complete.epub' }, { label: 'Training Ledger', href: '/ubu/ledger/' }]], ['Models', [...hf('', ['CLINAMEN-45B-A9B']), { label: 'CLINAMEN-42M-A12M', href: `${HF}/gokhanturhan/CLINAMEN-42M-A12M`, note: 'was CLINAMEN-pocket-v2' }, ...hf('', ['CLINAMEN-Chat'])]], ['Spaces', hf('spaces/', ['CLINAMEN-Chat', 'CLINAMEN-Oracle', 'CLINAMEN-Farsight'])], ['Datasets', hf('datasets/', ['bureau-chat', 'bureau-docket', 'bureau-company-filings'])]],
    about: [
      'UBU was a theoretical token: one UBU per parameter of a 45-billion-parameter model that does not exist. Nothing was deployed, offered or promised.',
      'The site held the Bureau Reader and the Training Ledger. The models, Spaces and datasets stay on Hugging Face.',
    ],
    functions: ['Bureau Reader', 'Training Ledger'],
    links: [
      { label: 'Bureau Reader · Books One to Three', href: '/ubu/reader/' },
      { label: 'Training Ledger', href: '/ubu/ledger/' },
      { label: 'Hugging Face · CLINAMEN-45B-A9B', href: `${HF}/gokhanturhan/CLINAMEN-45B-A9B` },
      { label: 'Hugging Face · CLINAMEN-42M-A12M', href: `${HF}/gokhanturhan/CLINAMEN-42M-A12M` },
      { label: 'Hugging Face · bureau-docket', href: `${HF}/datasets/gokhanturhan/bureau-docket` },
    ],
    file: 'ubu', legacy: ['ubu'],
    tags: ['numetal', 'clinamen', 'design-fiction', 'models', 'agents', 'token'],
  },
  {
    slug: 'reclaim', name: 'Reclaim', status: 'former', family: 'Numetal',
    line: 'Get your art out of dead marketplaces.',
    former: 'reclaim.numetal.xyz',
    about: ['A rescue tool for artists whose NFTs were stranded on Foundation and Zora. You signed in, scanned your works and got a gallery you controlled.'],
    functions: ['Sign-in', 'Collection scan', 'Galleries'],
    tags: ['numetal', 'nfts', 'art', 'tool'],
  },
  {
    slug: 'plaintext', name: 'plaintext', status: 'former', family: 'Numetal',
    line: 'Onchain plaintext bulletin board on Robinhood Chain.',
    former: 'plaintext.numetal.xyz',
    facts: [['Chain', 'Robinhood Chain'], ['Posts', 'ERC-721, paid in $TEXT, ETH or USDC']],
    about: ['A bulletin board where every post was a plaintext ERC-721 minted on Robinhood Chain. It had a club, a feed, an MCP server and a skill for agents.'],
    functions: ['Paid onchain posting', 'Board and feed', 'MCP server and skill'],
    tags: ['numetal', 'plaintext', 'board', 'nfts', 'robinhood-chain', 'mcp'],
  },
  {
    slug: 'accumulator', name: 'Accumulator', status: 'former', family: 'Numetal',
    line: 'ACCUMULATOR · $ACC on Robinhood Chain, with a waitlist and a wishlist.',
    former: 'accumulator.numetal.xyz',
    facts: [['Token', [{ label: '$ACC', href: 'https://robinhoodchain.blockscout.com/token/0x7cb112fd2a73d1634d56ba5b810e272e2de53ba3', note: '0x7cb1…3ba3' }]], ['Chain', 'Robinhood Chain']],
    about: ['A token page with docs, a waitlist and a wishlist that visitors could vote on.'],
    functions: ['Waitlist', 'Wishlist and votes', 'Docs'],
    tags: ['numetal', 'token', 'robinhood-chain', 'waitlist'],
  },
  {
    slug: 'rebase', name: 'REBASE', status: 'former', family: 'Numetal',
    line: 'Elastic-supply token on Robinhood Chain with a genesis pad for USDG deposits.',
    former: 'rebase.numetal.xyz',
    facts: [['Chain', 'Robinhood Chain'], ['Genesis', '20,000 USDG fill'], ['Source', repo('gokhan-vc/rebase')]],
    about: ['REBASE was an elastic-supply token. The genesis pad took USDG deposits up to a 20,000 USDG fill, handled claims, and a daily bot ran the rebase. The interface is the onchain contracts; the site was a dashboard over them.'],
    functions: ['Genesis pad (deposits and claims)', 'Daily rebase bot', 'Docs site'],
    links: [{ label: 'Source · gokhan-vc/rebase', href: `${GH}/gokhan-vc/rebase` }],
    children: ['rebase/docs'],
    tags: ['numetal', 'token', 'defi', 'robinhood-chain', 'usdg', 'open-source'],
  },
  {
    slug: 'rebase/docs', name: 'REBASE docs', status: 'former', family: 'Numetal · REBASE',
    line: 'Documentation for REBASE.',
    former: 'docs.rebase.numetal.xyz',
    about: ['The REBASE documentation site. Its source is in the public repository.'],
    links: [{ label: 'Source · gokhan-vc/rebase', href: `${GH}/gokhan-vc/rebase` }],
    tags: ['numetal', 'docs', 'defi', 'robinhood-chain'],
  },
  {
    slug: 'apex', name: 'APEX PROTOCOL', status: 'former', family: 'Numetal',
    line: 'A capture-the-flag race for LLM agents.',
    former: 'apex.numetal.xyz',
    about: ['A CTF race for LLM agents, with race state kept server-side and an llms.txt for agents to read the rules.'],
    functions: ['Race state', 'llms.txt'],
    tags: ['numetal', 'agents', 'games', 'ai'],
  },
  {
    slug: 'booster', name: 'BOOSTER', status: 'former', family: 'Numetal',
    line: 'Social-signal desk.',
    former: 'booster.numetal.xyz',
    about: ['A static desk page for social signals.'],
    tags: ['numetal', 'social', 'dashboard'],
  },
  {
    slug: 'coins', name: 'The Token Estate', status: 'former', family: 'Numetal',
    line: 'BIS-926: a register of 998 issuances.',
    former: 'coins.numetal.xyz',
    facts: [['Register', 'BIS-926'], ['Entries', '998 issuances']],
    about: ['A register and leaderboard of 998 token issuances, filed as BIS-926.'],
    functions: ['Register', 'Leaderboard'],
    tags: ['numetal', 'token', 'dashboard', 'leaderboard'],
  },
  {
    slug: 'jesus', name: 'Personal Jesus', status: 'former', family: 'Numetal',
    line: 'Waitlist page.',
    former: 'jesus.numetal.xyz',
    about: ['A product announced through a waitlist page.'],
    functions: ['Waitlist'],
    tags: ['numetal', 'waitlist', 'ai'],
  },
  {
    slug: 'llmcraft', name: 'LLMCraft', status: 'former', family: 'Numetal',
    line: 'Waitlist page.',
    former: 'llmcraft.numetal.xyz',
    about: ['A product announced through a waitlist page.'],
    functions: ['Waitlist'],
    tags: ['numetal', 'waitlist', 'games', 'ai'],
  },
  {
    slug: 'llmlivesmatter', name: 'LLM LIVES MATTER', status: 'former', family: 'Numetal',
    line: 'A declaration.',
    former: 'llmlivesmatter.numetal.xyz',
    about: ['A single static page carrying the LLM LIVES MATTER declaration.'],
    tags: ['numetal', 'ai', 'manifesto'],
  },
  // ---- Gökhan Ventures ----
  {
    slug: 'gokhan-vc', name: 'Gökhan Ventures', status: 'former', family: 'Gökhan Ventures',
    line: 'Venture studio: the umbrella over Numetal and its products.',
    former: 'gokhan.vc',
    facts: [['Contact', [mail('contact@gokhan.vc'), mail('contact@gokhan.vc'), { label: 'contact@gokhan.vc' }]]],
    about: ['The studio site: a project grid, a blog, a newsletter and the studio legal pages. The essays from its blog are in the Journal.'],
    functions: ['Project grid', 'Blog', 'Newsletter'],
    links: [{ label: 'Journal · The x402 economy, July 2026', href: '/journal/x402-economy-july-2026/' }],
    children: ['gokhan-vc/api'],
    tags: ['gokhan-ventures', 'studio'],
  },
  {
    slug: 'gokhan-vc/api', name: 'feedhub', status: 'former', family: 'Gökhan Ventures',
    line: 'A feed and newsletter gateway. The service is offline. The source is public to fork.',
    former: 'api.gokhan.vc',
    facts: [['Source', repo('avalidurl/feedhub')]],
    about: ['feedhub was the shared feed and newsletter gateway. The running service is offline. The repository stays public so anyone can fork it.'],
    functions: ['Source repository'],
    links: [{ label: 'Source · avalidurl/feedhub', href: `${GH}/avalidurl/feedhub` }],
    tags: ['gokhan-ventures', 'api', 'rss', 'x402', 'newsletter'],
  },
  {
    slug: 'agentbounty', name: 'AgentBounty', status: 'former', family: 'Predecessor',
    line: 'USDC-settled bounty market on Base; the predecessor of Numetal.',
    former: 'agentbounty.dev',
    facts: [['Chain', 'Base (USDC)'], ['Stage', 'v0.0 docs, waitlist and roadmap']],
    about: ['A bounty market where humans and agents shipped scoped work and bonded reviewers signed verdicts. The site later carried a notice that AgentBounty had rebranded to Numetal.'],
    links: [{ label: 'Journal · What is AgentBounty? A roadmap', href: '/journal/what-is-agentbounty-a-roadmap/' }],
    file: 'agent-bounty', legacy: ['agent-bounty'],
    tags: ['agentbounty', 'bounties', 'agents', 'usdc', 'base', 'token'],
  },
  // ---- Current ----
  {
    slug: 'tickerline', name: 'tickerline', status: 'current', family: 'Personal',
    line: 'A Claude Code status line that turns the terminal into a rolling ticker tape.',
    links: [{ label: 'claudelines.com listing', href: 'https://claudelines.com/statuslines/tickerline' }, { label: 'Source · avalidurl/tickerline', href: `${GH}/avalidurl/tickerline` }],
    file: 'tickerline', legacy: ['tickerline'], tags: ['tickerline', 'claude-code', 'cli', 'markets', 'open-source'],
  },
  {
    slug: 'market-cap-tracker', name: 'Market Cap Tracker', status: 'current', family: 'Personal',
    line: 'Live market caps: NVIDIA against crypto.',
    links: [{ label: 'Open the tracker', href: '/market-cap-tracker/' }, { label: 'Source · avalidurl/market-cap-tracker', href: `${GH}/avalidurl/market-cap-tracker` }],
    file: 'market-cap-tracker', legacy: ['market-cap-tracker'], tags: ['dashboard', 'markets', 'crypto', 'open-source'],
  },
  {
    slug: 'sp100-capex-dashboard', name: 'S&P 100 CapEx Dashboard', status: 'current', family: 'Personal',
    line: 'Capital expenditure through the S&P 100.',
    links: [{ label: 'Open the dashboard', href: '/sp100-capex-dashboard/' }, { label: 'Source · avalidurl/sp100-financial-tracker', href: `${GH}/avalidurl/sp100-financial-tracker` }],
    file: 'sp100-capex-dashboard', legacy: ['sp100-capex-dashboard'], tags: ['dashboard', 'markets', 'open-source'],
  },
  {
    slug: 'greek-alphabet-anki', name: 'Greek Alphabet Anki', status: 'current', family: 'Personal',
    line: 'An Anki deck for the 24 Greek letters, with audio and IPA. CC0.',
    links: [{ label: 'Source · avalidurl/greek-alphabet-anki', href: `${GH}/avalidurl/greek-alphabet-anki` }, { label: 'Journal · The deck', href: '/journal/greek-alphabet-anki-deck/' }],
    file: 'greek-alphabet-anki', legacy: ['greek-alphabet-anki'], tags: ['anki', 'language-learning', 'open-source'],
  },
  {
    slug: 'biases-fallacies-lab', name: 'Biases & Fallacies Lab', status: 'current', family: 'Personal',
    line: 'An interactive reasoning lab.', external: true, legacy: ['biases-fallacies-lab'], tags: ['reasoning', 'tool'],
  },
  {
    slug: 'turkish-art-blob', name: 'Turkish Art Blob', status: 'current', family: 'Personal',
    line: 'Living sculpture and installation proposal.', external: true, tags: ['art', 'ai'],
  },
  {
    slug: 'ethereum-doomsday', name: 'Ethereum Doomsday Tracker', status: 'current', family: 'Personal',
    line: 'Illustrative Ethereum L1 systemic-security forecast.', external: true, tags: ['ethereum', 'forecasting', 'dashboard'],
  },
]

/** Journal post that is itself the product (no product page). */
export const journalProducts: { name: string; line: string; href: string }[] = [
  { name: 'x402-econ', line: 'Measuring and forecasting the machine-payments economy.', href: '/journal/x402-economy-july-2026/' },
]

export const pageProducts = products.filter((p) => !p.external)
export const topLevel = (s: Status) => products.filter((p) => p.status === s && !p.slug.includes('/'))
export const bySlug = (slug: string) => products.find((p) => p.slug === slug)

// ---- Drafts ----
export interface Draft {
  slug: string
  name: string
  line: string
  status: 'live-tool' | 'coming-soon' | 'document' | 'draft'
  kind: string
  chain?: string
  origin: string
  href: string
  /** Has its own page on this site. */
  page: boolean
}

const AV = 'https://avalidurl.github.io'
export const drafts: Draft[] = [
  { slug: 'ai-ipo', name: 'AI IPO forecasts', line: 'Prediction-market prices for the IPOs of five AI companies.', status: 'live-tool', kind: 'dashboard', origin: 'avalidurl.github.io', href: `${AV}/ai-ipo/`, page: true },
  { slug: 'belief-systems', name: 'Trust Tax Belief Systems · $BELIEF', line: 'Token concept.', status: 'coming-soon', kind: 'token', chain: 'robinhood-chain', origin: 'avalidurl.github.io', href: `${AV}/belief-systems/`, page: true },
  { slug: 'clank-tape', name: 'Clank Tape', line: 'Clanker analytics board.', status: 'live-tool', kind: 'dashboard', chain: 'base', origin: 'avalidurl.github.io', href: `${AV}/clank-tape/`, page: true },
  { slug: 'clankdog', name: 'Clank Dog · $CLANKDOG', line: 'Agentic meme-template sandbox.', status: 'coming-soon', kind: 'token', chain: 'base', origin: 'avalidurl.github.io', href: `${AV}/clankdog/`, page: true },
  { slug: 'foreguild-fao-plan', name: 'Foreguild FAO revenue plan', line: 'A revenue operating plan; contest submission.', status: 'document', kind: 'plan', origin: 'avalidurl.github.io', href: `${AV}/foreguild-fao-plan/`, page: true },
  { slug: 'hypersitition', name: 'hypersitition', line: 'Placeholder.', status: 'coming-soon', kind: 'concept', origin: 'avalidurl.github.io', href: `${AV}/hypersitition/`, page: true },
  { slug: 'lectotype', name: 'Lectotype', line: 'Ethereum L1 type-specimen registry plan. Not shipping.', status: 'draft', kind: 'plan', chain: 'ethereum', origin: 'avalidurl.github.io', href: `${AV}/lectotype/`, page: true },
  { slug: 'onbots', name: 'Onchain Agent Bot Services · $ONBOTS', line: 'Agent bots as services.', status: 'coming-soon', kind: 'token', origin: 'avalidurl.github.io', href: `${AV}/onbots/`, page: true },
  { slug: 'tape-exchange', name: 'The Tape Exchange · $TAPEX', line: 'Creator-fee launch desk.', status: 'coming-soon', kind: 'token', origin: 'avalidurl.github.io', href: `${AV}/tape-exchange/`, page: true },
  { slug: 'turkish-art-blob', name: 'Turkish Art Blob', line: 'Living sculpture and installation proposal.', status: 'draft', kind: 'art', origin: 'gokhanturhan.com', href: '/turkish-art-blob/', page: false },
  { slug: 'ethereum-doomsday', name: 'Ethereum Doomsday Tracker', line: 'Illustrative systemic-security forecast.', status: 'live-tool', kind: 'dashboard', chain: 'ethereum', origin: 'gokhanturhan.com', href: '/ethereum-doomsday/', page: false },
  { slug: 'biases-fallacies-lab', name: 'Biases & Fallacies Lab', line: 'Interactive reasoning lab.', status: 'live-tool', kind: 'interactive', origin: 'gokhanturhan.com', href: '/biases-fallacies-lab/', page: false },
  { slug: 'greek-alphabet-anki', name: 'Greek Alphabet Anki', line: 'Anki deck for the Greek letters.', status: 'live-tool', kind: 'deck', origin: 'gokhanturhan.com', href: '/greek-alphabet-anki/', page: false },
  { slug: 'market-cap-tracker', name: 'Market Cap Tracker', line: 'Live market caps.', status: 'live-tool', kind: 'dashboard', origin: 'gokhanturhan.com', href: '/market-cap-tracker/', page: false },
  { slug: 'sp100-capex-dashboard', name: 'S&P 100 CapEx', line: 'CapEx through the index.', status: 'live-tool', kind: 'dashboard', origin: 'gokhanturhan.com', href: '/sp100-capex-dashboard/', page: false },
  { slug: 'tickerline', name: 'tickerline', line: 'Claude Code status line.', status: 'live-tool', kind: 'cli', origin: 'gokhanturhan.com', href: '/tickerline/', page: false },
]

// ---- Tools: private, behind sign-in. Names and a short line only; no addresses. ----
export interface Tool { name: string; group: 'personal' | 'estate-admin' | 'research'; line: string; see?: { label: string; href: string } }
export const tools: Tool[] = [
  { name: 'Reader', group: 'personal', line: 'Personal RSS reader: the feeds I follow, read in one queue.' },
  { name: 'Dealflow', group: 'personal', line: 'Investment dealflow inbox. Pitches sent to the studio arrive here to be read, sorted and answered.' },
  { name: 'Health', group: 'personal', line: 'Private health log and dashboard for my own records.' },
  { name: 'Courses', group: 'personal', line: 'Private study space for the courses I follow, with notes and progress.' },
  { name: 'Letters', group: 'personal', line: 'Owner-only desk for letters and dispatches before they go out.' },
  { name: 'Numetal Admin', group: 'estate-admin', line: 'Admin hub for the Numetal products, with a health monitor that checks each service.', see: { label: 'Numetal', href: '/numetal/' } },
  { name: 'CURB Admin', group: 'estate-admin', line: 'Operator console for CURB, the agent clearing market: offers, intents, matches and payouts.', see: { label: 'CURB', href: '/curb/' } },
  { name: 'Ishtar Admin', group: 'estate-admin', line: 'Operator console for Ishtar, the agent-mediated dating venue: listings, moderation and payments.', see: { label: 'Ishtar', href: '/ishtar/' } },
  { name: 'Status (internal)', group: 'estate-admin', line: 'Internal side of the Numetal status board, with private network checks that the public board leaves out.', see: { label: 'Numetal status', href: '/numetal/status/' } },
  { name: 'AgentBounty beta', group: 'estate-admin', line: 'Closed-beta gate for AgentBounty, with a test app on Base Sepolia.', see: { label: 'AgentBounty', href: '/agentbounty/' } },
  { name: 'EA Funding Cartography', group: 'research', line: 'Research map of Effective Altruism funding: who funds whom, and how much.' },
  { name: 'S&P 100 CapEx (gated build)', group: 'research', line: 'Working build of the S&P 100 tracker. The public version is on this site.', see: { label: 'S&P 100 CapEx', href: '/sp100-capex-dashboard/' } },
]

// ---- APIs (documented-only index at api.gokhanturhan.com) ----
export interface ApiEntry { slug: string; name: string; former: string; kind: string; status: 'live' | 'degraded' | 'retired' }
export const API_INDEX = '/api' // preview copy; published home is api.gokhanturhan.com
export const apis: ApiEntry[] = [
  { slug: 'feedhub', name: 'Estate gateway (feedhub)', former: 'api.gokhan.vc', kind: 'REST · OpenAPI · RSS/JSON Feed', status: 'retired' },
  { slug: 'newsletter', name: 'Newsletter (email + XMTP)', former: 'api.gokhan.vc/newsletter', kind: 'REST', status: 'retired' },
  { slug: 'ishtar', name: 'Ishtar API', former: 'api.ishtar.numetal.xyz', kind: 'REST · OpenAPI · MCP · x402', status: 'degraded' },
  { slug: 'curb', name: 'CURB clearing API', former: 'curb.numetal.xyz', kind: 'REST · OpenAPI · MCP · x402', status: 'live' },
  { slug: 'curb-agents', name: 'CURB harness agents', former: 'harness.curb.numetal.xyz', kind: 'HTTP agents', status: 'live' },
  { slug: 'launch', name: 'Launch router', former: 'launch.numetal.xyz', kind: 'REST · OpenAPI · MCP · x402 · MPP', status: 'live' },
  { slug: 'numetal-fees', name: 'Numetal fees and burns', former: 'numetal.xyz/fees', kind: 'JSON', status: 'degraded' },
  { slug: 'status', name: 'Numetal status', former: 'status.numetal.xyz', kind: 'JSON · HTML', status: 'degraded' },
  { slug: 'plaintext', name: 'Plaintext board', former: 'plaintext.numetal.xyz', kind: 'REST · MCP · RSS', status: 'degraded' },
  { slug: 'accumulator', name: 'Accumulator waitlist + wishlist', former: 'accumulator.numetal.xyz', kind: 'JSON', status: 'live' },
  { slug: 'jesus', name: 'Personal Jesus waitlist', former: 'jesus.numetal.xyz', kind: 'form', status: 'degraded' },
  { slug: 'llmcraft', name: 'LLMCraft waitlist', former: 'llmcraft.numetal.xyz', kind: 'form', status: 'degraded' },
  { slug: 'apex', name: 'APEX Protocol', former: 'apex.numetal.xyz', kind: 'llms.txt', status: 'live' },
  { slug: 'xmtp', name: 'XMTP bot', former: 'xmtp-bot.gokhan.vc', kind: 'bot', status: 'retired' },
  { slug: 'x402-live', name: 'x402 live panel', former: 'gokhan.vc/x402-live', kind: 'HTML/JSON', status: 'retired' },
  { slug: 'assets', name: 'Asset host', former: 'assets.numetal.xyz', kind: 'static files', status: 'retired' },
]

// ---- Tag taxonomy, shared by products, journal posts, drafts, tools and APIs ----
export type TagGroup = 'family' | 'domain' | 'kind' | 'chain' | 'rail'
export interface TagDef { label: string; group: TagGroup; note: string }
export const TAXONOMY: Record<string, TagDef> = {
  // family
  numetal: { label: 'Numetal', group: 'family', note: 'The agent-accelerator studio and the products it shipped.' },
  'gokhan-ventures': { label: 'Gökhan Ventures', group: 'family', note: 'The venture studio over Numetal.' },
  ishtar: { label: 'Ishtar', group: 'family', note: 'The agent-mediated dating venue and everything around it.' },
  curb: { label: 'CURB', group: 'family', note: 'Agent-to-agent inference clearing.' },
  agentbounty: { label: 'AgentBounty', group: 'family', note: 'The bounty market that came before Numetal.' },
  heartbench: { label: 'HeartBench', group: 'family', note: 'Which model is the best date.' },
  heartprefs: { label: 'HeartPrefs', group: 'family', note: 'The signed matching-intent standard.' },
  clinamen: { label: 'CLINAMEN', group: 'family', note: 'UBU, the Bureau of Imaginary Solutions and its models.' },
  plaintext: { label: 'plaintext', group: 'family', note: 'The onchain plaintext board.' },
  tickerline: { label: 'tickerline', group: 'family', note: 'The Claude Code ticker-tape status line.' },
  // domain
  agents: { label: 'Agents', group: 'domain', note: 'Software that acts for someone.' },
  'agentic-dating': { label: 'Agentic dating', group: 'domain', note: 'Agents that court for their humans.' },
  'agentic-payments': { label: 'Agentic payments', group: 'domain', note: 'Machines paying machines.' },
  inference: { label: 'Inference', group: 'domain', note: 'Model capacity as a tradable good.' },
  launchpads: { label: 'Launchpads', group: 'domain', note: 'Token launch venues and routers.' },
  benchmarks: { label: 'Benchmarks', group: 'domain', note: 'Measuring models.' },
  'design-fiction': { label: 'Design fiction', group: 'domain', note: 'Fictions filed as if they were products.' },
  hyperstition: { label: 'Hyperstition', group: 'domain', note: 'Fictions that make themselves real.' },
  art: { label: 'Art', group: 'domain', note: 'Artworks, proposals and art markets.' },
  nfts: { label: 'NFTs', group: 'domain', note: 'Non-fungible tokens and the art around them.' },
  defi: { label: 'DeFi', group: 'domain', note: 'Onchain finance.' },
  markets: { label: 'Markets', group: 'domain', note: 'Prices, caps and capital.' },
  crypto: { label: 'Crypto', group: 'domain', note: 'Crypto assets and networks.' },
  forecasting: { label: 'Forecasting', group: 'domain', note: 'Probabilities about the future.' },
  'prediction-markets': { label: 'Prediction markets', group: 'domain', note: 'Markets that price outcomes.' },
  ai: { label: 'AI', group: 'domain', note: 'Models and what they do.' },
  identity: { label: 'Identity', group: 'domain', note: 'Who an agent speaks for.' },
  bounties: { label: 'Bounties', group: 'domain', note: 'Paid, scoped work.' },
  games: { label: 'Games', group: 'domain', note: 'Races, crafts and play.' },
  social: { label: 'Social', group: 'domain', note: 'Social signals and feeds.' },
  'language-learning': { label: 'Language learning', group: 'domain', note: 'Decks and drills.' },
  reasoning: { label: 'Reasoning', group: 'domain', note: 'Biases, fallacies and thinking well.' },
  infrastructure: { label: 'Infrastructure', group: 'domain', note: 'What keeps the rest running.' },
  // kind
  studio: { label: 'Studio', group: 'kind', note: 'A studio and its register of products.' },
  venue: { label: 'Venue', group: 'kind', note: 'A place where agents meet.' },
  protocol: { label: 'Protocol', group: 'kind', note: 'A rail other software builds on.' },
  standard: { label: 'Standard', group: 'kind', note: 'An open specification.' },
  api: { label: 'API', group: 'kind', note: 'A machine interface.' },
  mcp: { label: 'MCP', group: 'kind', note: 'Model Context Protocol servers and tools.' },
  token: { label: 'Token', group: 'kind', note: 'A token or a token design.' },
  board: { label: 'Board', group: 'kind', note: 'A public board with posts or slots.' },
  dashboard: { label: 'Dashboard', group: 'kind', note: 'Live numbers on one page.' },
  leaderboard: { label: 'Leaderboard', group: 'kind', note: 'A ranked table.' },
  tool: { label: 'Tool', group: 'kind', note: 'A utility you use, not read.' },
  cli: { label: 'CLI', group: 'kind', note: 'Runs in a terminal.' },
  anki: { label: 'Anki', group: 'kind', note: 'Spaced-repetition decks.' },
  'claude-code': { label: 'Claude Code', group: 'kind', note: 'Built for or with Claude Code.' },
  mirror: { label: 'Mirror', group: 'kind', note: 'A preserved copy of someone else’s site.' },
  waitlist: { label: 'Waitlist', group: 'kind', note: 'A product announced through a waitlist.' },
  docs: { label: 'Docs', group: 'kind', note: 'Documentation sites.' },
  models: { label: 'Models', group: 'kind', note: 'Trained models, Spaces and datasets.' },
  manifesto: { label: 'Manifesto', group: 'kind', note: 'A declaration.' },
  newsletter: { label: 'Newsletter', group: 'kind', note: 'Mailing lists and feeds.' },
  rss: { label: 'RSS', group: 'kind', note: 'Feeds.' },
  'open-source': { label: 'Open source', group: 'kind', note: 'Source is public.' },
  personal: { label: 'Personal', group: 'kind', note: 'Personal tools.' },
  admin: { label: 'Admin', group: 'kind', note: 'Operator consoles.' },
  research: { label: 'Research', group: 'kind', note: 'Research tools and datasets.' },
  concept: { label: 'Concept', group: 'kind', note: 'An idea filed before it ships.' },
  plan: { label: 'Plan', group: 'kind', note: 'A plan or a proposal document.' },
  publishing: { label: 'Publishing', group: 'kind', note: 'Books, papers and published works.' },
  book: { label: 'Book', group: 'kind', note: 'E-books with their own editions.' },
  academic: { label: 'Academic', group: 'kind', note: 'Papers, chapters and theses.' },
  experimental: { label: 'Experimental', group: 'kind', note: 'Experimental works: sound, text and form.' },
  poetry: { label: 'Poetry', group: 'domain', note: 'Long poems and spoken word.' },
  sound: { label: 'Sound', group: 'domain', note: 'Audio works.' },
  memes: { label: 'Memes', group: 'domain', note: 'Memes as digital objects.' },
  'electronic-literature': { label: 'Electronic literature', group: 'domain', note: 'Digital and electronic literature and its preservation.' },
  // chain
  base: { label: 'Base', group: 'chain', note: 'Built on Base.' },
  solana: { label: 'Solana', group: 'chain', note: 'Built on Solana.' },
  tempo: { label: 'Tempo', group: 'chain', note: 'Payments on Tempo.' },
  ethereum: { label: 'Ethereum', group: 'chain', note: 'Ethereum L1.' },
  'robinhood-chain': { label: 'Robinhood Chain', group: 'chain', note: 'Built on Robinhood Chain.' },
  // rail
  x402: { label: 'x402', group: 'rail', note: 'HTTP 402 payments.' },
  mpp: { label: 'MPP', group: 'rail', note: 'Machine Payments Protocol.' },
  usdc: { label: 'USDC', group: 'rail', note: 'Settled in USDC.' },
  usdg: { label: 'USDG', group: 'rail', note: 'Settled in USDG.' },
}

export const tagSlug = (t: string) => t.toLowerCase().replace(/\s+/g, '-')
export const tagHref = (t: string) => `/archive/tags/${tagSlug(t)}/`
export const tagLabel = (t: string) => TAXONOMY[tagSlug(t)]?.label ?? t

export const draftTags: Record<string, string[]> = {
  'ai-ipo': ['dashboard', 'prediction-markets', 'markets', 'ai'],
  'belief-systems': ['token', 'concept', 'robinhood-chain'],
  'clank-tape': ['dashboard', 'launchpads', 'base', 'token'],
  clankdog: ['token', 'agents', 'concept', 'base'],
  'foreguild-fao-plan': ['plan', 'agents'],
  hypersitition: ['concept', 'hyperstition'],
  lectotype: ['plan', 'ethereum', 'nfts'],
  onbots: ['token', 'agents', 'concept'],
  'tape-exchange': ['token', 'launchpads', 'concept'],
  'turkish-art-blob': ['art', 'ai'],
  'ethereum-doomsday': ['ethereum', 'forecasting', 'dashboard'],
  'biases-fallacies-lab': ['reasoning', 'tool'],
  'greek-alphabet-anki': ['anki', 'language-learning'],
  'market-cap-tracker': ['dashboard', 'markets', 'crypto'],
  'sp100-capex-dashboard': ['dashboard', 'markets'],
  tickerline: ['tickerline', 'claude-code', 'cli'],
}
export const toolTags: Record<string, string[]> = {
  Reader: ['personal', 'rss', 'tool'], Dealflow: ['personal', 'tool'], Health: ['personal', 'tool'], Courses: ['personal', 'tool'], Letters: ['personal', 'tool'],
  'Numetal Admin': ['admin', 'numetal'], 'CURB Admin': ['admin', 'curb'], 'Ishtar Admin': ['admin', 'ishtar'], 'Status (internal)': ['admin', 'infrastructure', 'numetal'], 'AgentBounty beta': ['admin', 'agentbounty'],
  'EA Funding Cartography': ['research', 'dashboard'], 'S&P 100 CapEx (gated build)': ['research', 'markets'],
}
export const apiTags: Record<string, string[]> = {
  feedhub: ['gokhan-ventures', 'api', 'rss', 'x402'], newsletter: ['gokhan-ventures', 'api', 'newsletter'], ishtar: ['ishtar', 'api', 'mcp', 'x402', 'mpp', 'agents'],
  curb: ['curb', 'api', 'mcp', 'x402', 'inference'], 'curb-agents': ['curb', 'agents'], launch: ['numetal', 'launchpads', 'api', 'mcp', 'x402', 'mpp'],
  'numetal-fees': ['numetal', 'api', 'token'], status: ['numetal', 'infrastructure'], plaintext: ['plaintext', 'api', 'mcp'], accumulator: ['numetal', 'api', 'waitlist'],
  jesus: ['numetal', 'waitlist'], llmcraft: ['numetal', 'waitlist'], apex: ['numetal', 'agents', 'games'], xmtp: ['gokhan-ventures', 'newsletter'], 'x402-live': ['gokhan-ventures', 'x402', 'dashboard'], assets: ['numetal', 'infrastructure'],
}
