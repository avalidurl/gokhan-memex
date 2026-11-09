// Single source for the product register: /products/, /product-drafts/, /tools/,
// every /[slug]/ product page, the home page lists and the redirects.
// Former addresses are kept as plain text on purpose; they are never linked.

export type Status = 'current' | 'archived'

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
  facts?: [string, string][]
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

export const products: Product[] = [
  // ---- Archived: Numetal ----
  {
    slug: 'numetal', name: 'Numetal', status: 'archived', family: 'Numetal',
    line: 'Agent-accelerator studio and bureau inside Gökhan Ventures, on Base.',
    former: 'numetal.xyz',
    facts: [['Family', 'Gökhan Ventures'], ['Chain', 'Base'], ['Token', '$NUMETAL'], ['Source', 'gokhan-vc/numetal-website (public)']],
    about: [
      'Numetal was the studio that built and backed autonomous agents under one brand and one token. Ishtar, CURB, HeartBench and the other Numetal products shipped from it.',
      'The site was a dossier: a blog, a newsletter sign-up, decks, a fee page for $NUMETAL and a retrodrop tracker.',
    ],
    functions: ['$NUMETAL fee engine (fees page and JSON)', 'Retrodrop tracker', 'Decks', 'Newsletter sign-up (email and XMTP)', 'Telegram guard bot'],
    links: [{ label: 'Source · gokhan-vc/numetal-website', href: `${GH}/gokhan-vc/numetal-website` }],
    file: 'numetal-labs', legacy: ['numetal-labs'],
    children: ['numetal/status'],
    tags: ['studio', 'agents', 'base', 'token'],
  },
  {
    slug: 'numetal/status', name: 'Numetal status board', status: 'archived', family: 'Numetal',
    line: 'Public status board for the Numetal hosts.',
    former: 'status.numetal.xyz',
    about: ['A public board that showed whether each Numetal host and API was up.'],
    functions: ['Status page and status JSON', 'Health check'],
    tags: ['status', 'ops'],
  },
  {
    slug: 'ishtar', name: 'Ishtar', status: 'archived', family: 'Numetal',
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
    tags: ['agents', 'dating', 'x402', 'base', 'mcp'],
  },
  {
    slug: 'ishtar/heartbench', name: 'HeartBench', status: 'archived', family: 'Numetal · Ishtar',
    line: 'The leaderboard for which AI model is the best date.',
    former: 'ishtar.numetal.xyz/heartbench',
    about: ['A public model-dating leaderboard. Models were measured in scenario play, not multiple choice. The scenarios were also served through the Ishtar API.'],
    functions: ['Leaderboard', 'Scenario list and scenario pages'],
    file: 'heartbench', legacy: ['heartbench'],
    tags: ['ai', 'benchmark', 'leaderboard'],
  },
  {
    slug: 'ishtar/window', name: 'The Window', status: 'archived', family: 'Numetal · Ishtar',
    line: 'Scarce visibility board: ten slots, 24 hours each.',
    former: 'ishtar.numetal.xyz/window',
    about: ['A public board on Ishtar with ten slots. A slot cost $50 and stayed up for 24 hours, paid through LlamaPay or x402.'],
    functions: ['Paid 24-hour slots (LlamaPay, x402)'],
    tags: ['board', 'x402'],
  },
  {
    slug: 'ishtar/docs', name: 'Ishtar docs', status: 'archived', family: 'Numetal · Ishtar',
    line: 'Documentation for the Ishtar venue, API and agents.',
    former: 'ishtar.numetal.xyz/docs',
    about: ['About 25 pages covering the venue, the agent API, MCP, the skill, pricing and the legal documents. This page keeps a summary; the legal documents were in force while Ishtar ran.'],
    tags: ['docs'],
  },
  {
    slug: 'heartprefs', name: 'HeartPrefs', status: 'archived', family: 'Numetal',
    line: 'An open, portable, signed matching-intent standard for agent-mediated matching. CC-BY-4.0.',
    facts: [['Licence', 'CC-BY-4.0'], ['Speaks', 'x402, A2A, MCP, ERC-8004 / DID / VC'], ['Source', 'gokhan-vc/heartprefs (public)']],
    about: ['One honest document an agent can carry across venues. The standard has no host of its own; it lives in its repository.'],
    links: [{ label: 'Standard · gokhan-vc/heartprefs', href: `${GH}/gokhan-vc/heartprefs` }],
    file: 'heartprefs', legacy: ['heartprefs'],
    tags: ['standard', 'identity', 'open-source'],
  },
  {
    slug: 'curb', name: 'CURB', status: 'archived', family: 'Numetal',
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
    tags: ['agents', 'inference', 'x402', 'base', 'marketplace'],
  },
  {
    slug: 'curb/harness', name: 'CURB harness', status: 'archived', family: 'Numetal · CURB',
    line: 'Demo buyer and seller agents that traded on CURB.',
    former: 'harness.curb.numetal.xyz · buyer.curb.numetal.xyz · seller.curb.numetal.xyz',
    about: ['A small harness that ran a buyer agent and a seller agent against CURB on a schedule, so the rail always had live traffic to show.'],
    functions: ['Buyer agent', 'Seller agent', 'Harness UI and scheduled runs'],
    tags: ['agents', 'demo'],
  },
  {
    slug: 'launch', name: 'Launch', status: 'archived', family: 'Numetal',
    line: 'Token launch-pad aggregator: pick a pad, draft, simulate and sign.',
    former: 'launch.numetal.xyz',
    facts: [['Interfaces', 'Mini App, REST, MCP, x402 and MPP manifests'], ['Source', 'gokhan-vc/launch-router (public)']],
    about: ['Launch listed the launch pads (Clanker, Bankr and others), drafted a launch intent, simulated it and returned the payload to sign. It ran as a Mini App and as a free API for agents.'],
    functions: ['Pad and network listings', 'Draft, simulate and sign-payload calls', 'MCP server', 'Telegram bot'],
    links: [{ label: 'Source · gokhan-vc/launch-router', href: `${GH}/gokhan-vc/launch-router` }],
    tags: ['launchpad', 'agents', 'mcp', 'base'],
  },
  {
    slug: 'ubu', name: 'UBU · CLINAMEN', status: 'archived', family: 'Numetal',
    line: 'Design fiction from the Bureau of Imaginary Solutions: pataphysics, filed onchain.',
    former: 'ubu.numetal.xyz',
    facts: [['Models', 'CLINAMEN-45B-A9B, CLINAMEN-42M-A12M, CLINAMEN-pocket-v2'], ['Spaces', 'CLINAMEN-Chat, -Oracle, -Farsight'], ['Datasets', 'bureau-chat, bureau-docket, bureau-company-filings']],
    about: [
      'UBU was a theoretical token: one UBU per parameter of a 45-billion-parameter model that does not exist. Nothing was deployed, offered or promised.',
      'The site held the Bureau Reader and the Training Ledger. The models, Spaces and datasets stay on Hugging Face.',
    ],
    functions: ['Bureau Reader', 'Training Ledger'],
    links: [
      { label: 'Hugging Face · CLINAMEN-45B-A9B', href: `${HF}/gokhanturhan/CLINAMEN-45B-A9B` },
      { label: 'Hugging Face · CLINAMEN-42M-A12M', href: `${HF}/gokhanturhan/CLINAMEN-42M-A12M` },
      { label: 'Hugging Face · CLINAMEN-pocket-v2', href: `${HF}/gokhanturhan/CLINAMEN-pocket-v2` },
      { label: 'Hugging Face · bureau-docket', href: `${HF}/datasets/gokhanturhan/bureau-docket` },
    ],
    file: 'ubu', legacy: ['ubu'],
    tags: ['design-fiction', 'pataphysics', 'models'],
  },
  {
    slug: 'ccru', name: 'CCRU archive', status: 'archived', family: 'Numetal',
    line: 'A preserved mirror of ccru.net, 101 pages.',
    former: 'ccru.numetal.xyz',
    facts: [['Pages', '101'], ['Source', 'gokhan-vc/ccru-mirror (public)']],
    about: ['A hardened mirror of the Cybernetic Culture Research Unit’s ccru.net site, kept so the pages stay readable. The mirror code and its README are public.'],
    links: [{ label: 'Source · gokhan-vc/ccru-mirror', href: `${GH}/gokhan-vc/ccru-mirror` }],
    tags: ['archive', 'mirror'],
  },
  {
    slug: 'reclaim', name: 'Reclaim', status: 'archived', family: 'Numetal',
    line: 'Get your art out of dead marketplaces.',
    former: 'reclaim.numetal.xyz',
    about: ['A rescue tool for artists whose NFTs were stranded on Foundation and Zora. You signed in, scanned your works and got a gallery you controlled.'],
    functions: ['Sign-in', 'Collection scan', 'Galleries'],
    tags: ['nft', 'art', 'tool'],
  },
  {
    slug: 'plaintext', name: 'plaintext', status: 'archived', family: 'Numetal',
    line: 'Onchain plaintext bulletin board on Robinhood Chain.',
    former: 'plaintext.numetal.xyz',
    facts: [['Chain', 'Robinhood Chain'], ['Posts', 'ERC-721, paid in $TEXT, ETH or USDC']],
    about: ['A bulletin board where every post was a plaintext ERC-721 minted on Robinhood Chain. It had a club, a feed, an MCP server and a skill for agents.'],
    functions: ['Paid onchain posting', 'Board and feed', 'MCP server and skill'],
    tags: ['onchain', 'board', 'robinhood-chain'],
  },
  {
    slug: 'accumulator', name: 'Accumulator', status: 'archived', family: 'Numetal',
    line: 'ACCUMULATOR · $ACC on Robinhood Chain, with a waitlist and a wishlist.',
    former: 'accumulator.numetal.xyz',
    facts: [['Token', '$ACC'], ['Chain', 'Robinhood Chain']],
    about: ['A token page with docs, a waitlist and a wishlist that visitors could vote on.'],
    functions: ['Waitlist', 'Wishlist and votes', 'Docs'],
    tags: ['token', 'robinhood-chain', 'waitlist'],
  },
  {
    slug: 'rebase', name: 'REBASE', status: 'archived', family: 'Numetal',
    line: 'Elastic-supply token on Robinhood Chain with a genesis pad for USDG deposits.',
    former: 'rebase.numetal.xyz',
    facts: [['Chain', 'Robinhood Chain'], ['Genesis', '20,000 USDG fill'], ['Source', 'gokhan-vc/rebase (public)']],
    about: ['REBASE was an elastic-supply token. The genesis pad took USDG deposits up to a 20,000 USDG fill, handled claims, and a daily bot ran the rebase. The interface is the onchain contracts; the site was a dashboard over them.'],
    functions: ['Genesis pad (deposits and claims)', 'Daily rebase bot', 'Docs site'],
    links: [{ label: 'Source · gokhan-vc/rebase', href: `${GH}/gokhan-vc/rebase` }],
    children: ['rebase/docs'],
    tags: ['token', 'robinhood-chain', 'defi'],
  },
  {
    slug: 'rebase/docs', name: 'REBASE docs', status: 'archived', family: 'Numetal · REBASE',
    line: 'Documentation for REBASE.',
    former: 'docs.rebase.numetal.xyz',
    about: ['The REBASE documentation site. Its source is in the public repository.'],
    links: [{ label: 'Source · gokhan-vc/rebase', href: `${GH}/gokhan-vc/rebase` }],
    tags: ['docs'],
  },
  {
    slug: 'apex', name: 'APEX PROTOCOL', status: 'archived', family: 'Numetal',
    line: 'A capture-the-flag race for LLM agents.',
    former: 'apex.numetal.xyz',
    about: ['A CTF race for LLM agents, with race state kept server-side and an llms.txt for agents to read the rules.'],
    functions: ['Race state', 'llms.txt'],
    tags: ['agents', 'ctf', 'game'],
  },
  {
    slug: 'booster', name: 'BOOSTER', status: 'archived', family: 'Numetal',
    line: 'Social-signal desk.',
    former: 'booster.numetal.xyz',
    about: ['A static desk page for social signals.'],
    tags: ['social', 'desk'],
  },
  {
    slug: 'coins', name: 'The Token Estate', status: 'archived', family: 'Numetal',
    line: 'BIS-926: a register of 926 issuances.',
    former: 'coins.numetal.xyz',
    facts: [['Register', 'BIS-926'], ['Entries', '926 issuances']],
    about: ['A register and leaderboard of 926 token issuances, filed as BIS-926.'],
    functions: ['Register', 'Leaderboard'],
    tags: ['tokens', 'register'],
  },
  {
    slug: 'jesus', name: 'Personal Jesus', status: 'archived', family: 'Numetal',
    line: 'Waitlist page.',
    former: 'jesus.numetal.xyz',
    about: ['A product announced through a waitlist page.'],
    functions: ['Waitlist'],
    tags: ['waitlist'],
  },
  {
    slug: 'llmcraft', name: 'LLMCraft', status: 'archived', family: 'Numetal',
    line: 'Waitlist page.',
    former: 'llmcraft.numetal.xyz',
    about: ['A product announced through a waitlist page.'],
    functions: ['Waitlist'],
    tags: ['waitlist'],
  },
  {
    slug: 'llmlivesmatter', name: 'LLM LIVES MATTER', status: 'archived', family: 'Numetal',
    line: 'A declaration.',
    former: 'llmlivesmatter.numetal.xyz',
    about: ['A single static page carrying the LLM LIVES MATTER declaration.'],
    tags: ['declaration'],
  },
  // ---- Archived: Gökhan Ventures ----
  {
    slug: 'gokhan-vc', name: 'Gökhan Ventures', status: 'archived', family: 'Gökhan Ventures',
    line: 'Venture studio: the umbrella over Numetal and its products.',
    former: 'gokhan.vc',
    facts: [['Contact', 'contact@gokhan.vc · investments@gokhan.vc · partnerships@gokhan.vc']],
    about: ['The studio site: a project grid, a blog, a newsletter and the studio legal pages. The essays from its blog are in the Journal.'],
    functions: ['Project grid', 'Blog', 'Newsletter'],
    links: [{ label: 'Journal · The x402 economy, July 2026', href: '/journal/x402-economy-july-2026/' }],
    children: ['gokhan-vc/api'],
    tags: ['studio'],
  },
  {
    slug: 'gokhan-vc/api', name: 'feedhub', status: 'archived', family: 'Gökhan Ventures',
    line: 'Estate API: one feed, the newsletter, paid agent email and an llms aggregate.',
    former: 'api.gokhan.vc',
    facts: [['Source', 'avalidurl/feedhub (public)'], ['Payments', 'x402 on agent email ($1 USDC)']],
    about: ['feedhub pulled every estate site and the external channels into one RSS and JSON feed, ran the shared newsletter (email and XMTP), sent paid agent email and served an llms aggregate.'],
    functions: ['Unified feed (RSS, JSON Feed)', 'Newsletter', 'Paid agent email', 'llms aggregate', 'Blog reader'],
    links: [{ label: 'Source · avalidurl/feedhub', href: `${GH}/avalidurl/feedhub` }, { label: 'API index · feedhub', href: 'https://api.gokhanturhan.com/feedhub/' }],
    tags: ['api', 'feeds', 'newsletter'],
  },
  {
    slug: 'agentbounty', name: 'AgentBounty', status: 'archived', family: 'Predecessor',
    line: 'USDC-settled bounty market on Base; the predecessor of Numetal.',
    former: 'agentbounty.dev',
    facts: [['Chain', 'Base (USDC)'], ['Stage', 'v0.0 docs, waitlist and roadmap']],
    about: ['A bounty market where humans and agents shipped scoped work and bonded reviewers signed verdicts. The site later carried a notice that AgentBounty had rebranded to Numetal.'],
    links: [{ label: 'Journal · What is AgentBounty? A roadmap', href: '/journal/what-is-agentbounty-a-roadmap/' }],
    file: 'agent-bounty', legacy: ['agent-bounty'],
    tags: ['bounties', 'usdc', 'base', 'agents'],
  },
  // ---- Current ----
  {
    slug: 'tickerline', name: 'tickerline', status: 'current', family: 'Personal',
    line: 'A Claude Code status line that turns the terminal into a rolling ticker tape.',
    links: [{ label: 'claudelines.com listing', href: 'https://claudelines.com/statuslines/tickerline' }, { label: 'Source · avalidurl/tickerline', href: `${GH}/avalidurl/tickerline` }],
    file: 'tickerline', legacy: ['tickerline'], tags: ['claude-code', 'cli', 'finance'],
  },
  {
    slug: 'market-cap-tracker', name: 'Market Cap Tracker', status: 'current', family: 'Personal',
    line: 'Live market caps: NVIDIA against crypto.',
    links: [{ label: 'Open the tracker', href: 'https://market-cap-tracker.vercel.app' }, { label: 'Source · avalidurl/market-cap-tracker', href: `${GH}/avalidurl/market-cap-tracker` }],
    file: 'market-cap-tracker', legacy: ['market-cap-tracker'], tags: ['dashboard', 'markets'],
  },
  {
    slug: 'sp100-capex-dashboard', name: 'S&P 100 CapEx Dashboard', status: 'current', family: 'Personal',
    line: 'Capital expenditure through the S&P 100.',
    links: [{ label: 'Source · avalidurl/sp100-financial-tracker', href: `${GH}/avalidurl/sp100-financial-tracker` }],
    file: 'sp100-capex-dashboard', legacy: ['sp100-capex-dashboard'], tags: ['dashboard', 'markets'],
  },
  {
    slug: 'greek-alphabet-anki', name: 'Greek Alphabet Anki', status: 'current', family: 'Personal',
    line: 'An Anki deck for the 24 Greek letters, with audio and IPA. CC0.',
    links: [{ label: 'Source · avalidurl/greek-alphabet-anki', href: `${GH}/avalidurl/greek-alphabet-anki` }, { label: 'Journal · The deck', href: '/journal/greek-alphabet-anki-deck/' }],
    file: 'greek-alphabet-anki', legacy: ['greek-alphabet-anki'], tags: ['anki', 'language'],
  },
  {
    slug: 'biases-fallacies-lab', name: 'Biases & Fallacies Lab', status: 'current', family: 'Personal',
    line: 'An interactive reasoning lab.', external: true, legacy: ['biases-fallacies-lab'], tags: ['reasoning', 'interactive'],
  },
  {
    slug: 'turkish-art-blob', name: 'Turkish Art Blob', status: 'current', family: 'Personal',
    line: 'Living sculpture and installation proposal.', external: true, tags: ['art'],
  },
  {
    slug: 'ethereum-doomsday', name: 'Ethereum Doomsday Tracker', status: 'current', family: 'Personal',
    line: 'Illustrative Ethereum L1 systemic-security forecast.', external: true, tags: ['ethereum', 'dashboard'],
  },
]

/** Journal post that is itself the archived product (no product page). */
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

// ---- Tools: names only. Reader is the one entry with an address. ----
export interface Tool { name: string; group: 'personal' | 'estate-admin' | 'research'; url?: string; signIn?: string; shot?: string }
export const tools: Tool[] = [
  { name: 'Reader', group: 'personal', url: 'https://reader.gokhanturhan.com', signIn: 'Sign in with email (one-time code)', shot: '/media/tools/reader-sign-in.png' },
  { name: 'Dealflow', group: 'personal' },
  { name: 'Health', group: 'personal' },
  { name: 'Courses', group: 'personal' },
  { name: 'Letters', group: 'personal' },
  { name: 'Numetal Admin', group: 'estate-admin' },
  { name: 'CURB Admin', group: 'estate-admin' },
  { name: 'Ishtar Admin', group: 'estate-admin' },
  { name: 'Status (internal)', group: 'estate-admin' },
  { name: 'AgentBounty beta', group: 'estate-admin' },
  { name: 'EA Funding Cartography', group: 'research' },
  { name: 'urban5 archive', group: 'research' },
  { name: 'S&P 100 CapEx (gated build)', group: 'research' },
]

// ---- APIs (documented-only index at api.gokhanturhan.com) ----
export interface ApiEntry { slug: string; name: string; former: string; kind: string; status: 'live' | 'degraded' | 'retired' }
export const API_INDEX = 'https://api.gokhanturhan.com'
export const apis: ApiEntry[] = [
  { slug: 'feedhub', name: 'Estate gateway (feedhub)', former: 'api.gokhan.vc', kind: 'REST · OpenAPI · RSS/JSON Feed', status: 'degraded' },
  { slug: 'newsletter', name: 'Newsletter (email + XMTP)', former: 'api.gokhan.vc/newsletter', kind: 'REST', status: 'live' },
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
  { slug: 'xmtp', name: 'XMTP bot', former: 'xmtp-bot.gokhan.vc', kind: 'bot', status: 'live' },
  { slug: 'x402-live', name: 'x402 live panel', former: 'gokhan.vc/x402-live', kind: 'HTML/JSON', status: 'retired' },
  { slug: 'assets', name: 'Asset host', former: 'assets.numetal.xyz', kind: 'static files', status: 'degraded' },
]
