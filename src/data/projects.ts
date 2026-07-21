// Single source of truth for the project lists shown on the homepage AND on
// /projects/. Both pages import from here so they can never drift again.
// All external URLs verified live 2026-07-21.

export interface RegisterProject {
  name: string
  desc: string
  where: string
  href: string
}

// The full register — one ruled cell each. Ordered: agent-native products,
// data/research, culture, then local project files.
export const registerProjects: RegisterProject[] = [
  { name: 'Ishtar', desc: 'agent-native courtship venue — agents court, humans meet', where: 'ishtar.numetal.xyz', href: 'https://ishtar.numetal.xyz' },
  { name: 'CURB', desc: 'agent↔agent inference clearing rail, USDC over x402', where: 'curb.numetal.xyz', href: 'https://curb.numetal.xyz' },
  { name: 'HeartBench', desc: 'which model is the best date — public leaderboard', where: 'ishtar.numetal.xyz/heartbench', href: 'https://ishtar.numetal.xyz/heartbench/' },
  { name: 'The Window', desc: 'scarce visibility board — $50, 24h, ten slots', where: 'ishtar.numetal.xyz/window', href: 'https://ishtar.numetal.xyz/window/' },
  { name: 'CLINAMEN / $UBU', desc: 'pataphysical fiction, filed on-chain', where: 'ubu.numetal.xyz', href: 'https://ubu.numetal.xyz' },
  { name: 'Plaintext', desc: 'onchain plaintext board — post on 4663', where: 'plaintext.numetal.xyz', href: 'https://plaintext.numetal.xyz' },
  { name: 'Reclaim', desc: 'get your art out of dead marketplaces', where: 'reclaim.numetal.xyz', href: 'https://reclaim.numetal.xyz' },
  { name: 'x402-econ', desc: 'measuring & forecasting the machine-payments economy', where: 'gokhan.vc — the report', href: 'https://gokhan.vc/blog/x402-economy-july-2026' },
  { name: 'tickerline', desc: 'Claude Code status line as a ticker tape — audited on ClaudeLines', where: 'claudelines.com', href: 'https://claudelines.com/statuslines/tickerline' },
  { name: 'Numetal', desc: 'the studio — agent accelerator, on Base', where: 'numetal.xyz', href: 'https://numetal.xyz' },
  { name: 'CCRU archive', desc: 'ccru.net preserved — 101 pages, mirrored', where: 'ccru.numetal.xyz', href: 'https://ccru.numetal.xyz' },
  { name: 'feedhub', desc: 'newsletter & feed gateway — email + XMTP, one dispatch', where: 'api.gokhan.vc', href: 'https://api.gokhan.vc/feed.xml' },
  { name: 'Agent Bounty', desc: 'project file — agent bounty experiments', where: 'filed here', href: '/projects/agent-bounty/' },
  { name: 'Market Cap Tracker', desc: 'project file — live market caps', where: 'filed here', href: '/projects/market-cap-tracker/' },
  { name: 'S&P 100 CapEx Dashboard', desc: 'project file — capex through the index', where: 'filed here', href: '/projects/sp100-capex-dashboard/' },
  { name: 'Biases & Fallacies Lab', desc: 'project file — interactive reasoning lab', where: 'filed here', href: '/projects/biases-fallacies-lab/' },
]

export interface IndexRow {
  no: string
  name: string
  note: string
  href: string
  external: boolean
}

// The compact stacked index box: INDEX opens the full list, the rest jump out.
export const projectIndex: IndexRow[] = [
  { no: '01', name: 'INDEX', note: 'all project files, filed here', href: '/projects/', external: false },
  { no: '02', name: 'CURB', note: 'agent↔agent inference clearing rail', href: 'https://curb.numetal.xyz', external: true },
  { no: '03', name: 'ISHTAR', note: 'agents court, humans meet', href: 'https://ishtar.numetal.xyz', external: true },
  { no: '04', name: 'CLINAMEN', note: 'pataphysical fiction, filed on-chain', href: 'https://ubu.numetal.xyz', external: true },
  { no: '05', name: 'PLAINTEXT', note: 'onchain plaintext board', href: 'https://plaintext.numetal.xyz', external: true },
  { no: '06', name: 'RECLAIM', note: 'get your art out of dead marketplaces', href: 'https://reclaim.numetal.xyz', external: true },
]
