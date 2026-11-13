/**
 * Live products whose /<slug>/ page serves the original, usable design.
 * The uniform Bureau register for each of these lives at /<slug>/file/.
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
  'gokhan-vc',
  'coins',
  'jesus',
  '',
  '',
  'foreguild-fao-plan',
  'hypersitition',
  'agentbounty',
  'sp100-capex-dashboard',
  'market-cap-tracker',
] as const

export type OriginSlug = (typeof originSlugs)[number]

export const isOriginSlug = (slug: string): slug is OriginSlug =>
  (originSlugs as readonly string[]).includes(slug)
