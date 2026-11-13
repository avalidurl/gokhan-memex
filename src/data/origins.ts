/**
 * Live products that also have a /<slug>/file/ filing.
 * For most of these, /<slug>/ is the original standalone app (mounted from
 * origins/<slug>/ after the Astro build) and /<slug>/file/ is the Bureau register.
 * Exception: /coins/ is the Astro register (not an origin mount) and /coins/file/
 * is a short guide to that register.
 */
export const originSlugs = [
  'curb',
  'ishtar',
  'ubu',
  'reclaim',
  'plaintext',
  'numetal',
  'launch',
  'accumulator',
  'rebase',
  'apex',
  'booster',
  'clank-tape',
  'gokhan-vc',
  'coins',
  'jesus',
  'llmcraft',
  'llmlivesmatter',
  'onbots',
  'tape-exchange',
  'clankdog',
  'ai-ipo',
  'belief-systems',
  'foreguild-fao-plan',
  'hypersitition',
  'lectotype',
  'agentbounty',
  'sp100-capex-dashboard',
  'market-cap-tracker',
] as const

export type OriginSlug = (typeof originSlugs)[number]

export const isOriginSlug = (slug: string): slug is OriginSlug =>
  (originSlugs as readonly string[]).includes(slug)
