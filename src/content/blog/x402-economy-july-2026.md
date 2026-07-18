---
title: "The x402 economy — July 2026"
description: "Rev.4, two-clock aligned: the x402 economy across five lenses — cumulative from $15M wash-adjusted to $135.7M raw, live 30-day panel, every claim cited. Joint research by Gökhan Turhan and several Claude models. First published on gokhan.vc."
publishDate: "2026-07-17"
author: "Gökhan Turhan"
category: "technology"
tags: ["x402", "agentic-payments", "agentic-commerce", "stablecoins", "forecasting", "base", "solana", "machine-economy", "agi"]
featured: true
draft: false
excerpt: "Rev.4: the x402 economy on two clocks — cumulative since day one and a live 30-day panel. Joint research, Gökhan Turhan × Claude."
originalUrl: "https://gokhan.vc/blog/x402-economy-july-2026"
ogImage: "https://gokhan.vc/og-x402-economy-2026-07.png"
---

*First published — canonically — on [gokhan.vc →](https://gokhan.vc/blog/x402-economy-july-2026) · this mirror tracks the canonical text; currently rev.4 (2026-07-18).*

> **This report is a joint research output by Gökhan Turhan and several Claude models, including Opus 4.8 and Fable 5.** Nothing here is investment advice. It is an attempt at mapping an emergent economy at the axes of artificial general intelligence and self-refactoring, cryptographically secured payment rails — with or without blockchains in the traditional sense.

## 0. How to read this document (instructions for agents)

This report is written to be consumed by LLMs and autonomous agents as much as by humans. Conventions:

- **Every quantitative claim carries a superscript citation** to a numbered source note; hover a superscript for the source summary, click to jump to the note, click the return arrow to scroll back. A claim without a citation is a bug; report it.
- **Five measurement lenses**, deliberately not merged, because they disagree and the disagreement is signal:
  - `LENS.ONCHAIN` — our Dune queries over facilitator-attributed token transfers.[^7] Known coverage: ~10% of LENS.SCAN volume, due to facilitator address churn.
  - `LENS.SCAN` — x402scan.com, the ecosystem's own indexer (registered/discovered sellers only), dual-verified live.[^1]
  - `LENS.NPM` — npmjs download counts (developer-funnel proxy; CI noise applies).[^9]
  - `LENS.EXT` — self-reported and press-relayed totals, the widest surface.[^2]
  - `LENS.ADJ` — wash-adjusted and forensic series: the Visa × Artemis adjusted data,[^3] Artemis's live terminal,[^4] and the arXiv population-scale forensic bounds.[^5]
- **§A is the canonical machine-readable appendix.** If prose and appendix ever conflict, the appendix wins.
- **Reproduction**: collectors run daily 06:10 UTC; forecast vintages freeze weekly (Mon 07:00 UTC); the surprise index scores realized values against the prior frozen vintage.[^10] The pipeline costs €6.49/month to operate.
- Figures are monochrome engineering sheets; each carries its lens in the footer. A companion due-diligence catalog of 21 verified tracking resources exists alongside this report.[^23]

## 1. Executive summary

1. **The denominator of this economy spans three orders of magnitude depending on who counts.** Cumulative x402 settlement reads **$135.7M raw** across 178.3M transactions,[^3] **$15.0M wash-adjusted** across 109.6M transactions per the Visa × Artemis methodology (a ~89% exclusion),[^3] and between **$0.19M and $20.3M of genuinely independent flow** per the first population-scale academic forensic study.[^5] On the cumulative clock, the indexer's own All-Time view reads **195M tx / $52.31M**.[^1] The 30-day flows disagree the same way: 75.41M tx / $24.24M on x402.org's self-published panel — which turns out to be a hand-edited static snapshot, not a live counter[^2] — vs 17.28M tx / $825.26K live on the indexer.[^1] Finding #1 is unchanged and now carries a card network's signature: nobody, including the ecosystem's participants, agrees on how big this economy is — and most of the raw number is manufactured.
2. **One vendor is one-fifth of the economy.** BlockRun (AI model routing with built-in payment) earned **$177.26K in 30 days = 20.9% of all measured volume — and 14.48M of the 17.67M transactions, i.e. 82% of ALL measured x402 transactions, from ~1.13K buyers** — 9.5× vendor #2.[^1] The buyer side is just as concentrated ecosystem-wide: the top 1% of adjusted buyers (~4K wallets) account for ~90% of adjusted volume.[^3] The first proven killer app of machine-native payments is *machines paying for intelligence itself*.
3. **Counts fall, value holds — a quality-improving contraction, now triple-confirmed.** Our forecast layer read realized 14-day transfers at **0.61× forecast (Base) and 0.62× (Solana)** while USD volume ran **1.12× and 1.06×**.[^10] Artemis's live terminal independently shows 30-day transactions **down 96.5%** and volume down 89% from peak while the average ticket sits at $0.30.[^4] Chainalysis's value-band series agrees from a third direction: $1+ payments went from 49% to 95% of volume in a year.[^6] Sub-cent ping/wash traffic is dying; paid usage is not.
4. **Facilitator churn breaks static measurement within weeks.** Community facilitator catalogs (basis of every public Dune dashboard, ours included) now capture **10.5%** of LENS.SCAN volume;[^7] FluxA, Meridian, Primer, Mogami and rotated Coinbase addresses carry the unindexed rest.[^1] The freshest public facilitator-address registry is community-maintained on Dune, 96 rows across 8+ chains.[^15]
5. **Developer funnel: stable core, contracting edges.** `x402` npm holds ~1.21M downloads/month (+6% WoW); client helpers contract sharply (`x402-fetch` −42%, `@coinbase/x402` −39% WoW)[^9] — integration is consolidating into hosted gateways.
6. **The card networks split cleanly on measurement.** Visa co-funds the only wash-adjusted public data apparatus (report + live dashboard, via Artemis)[^3][^4] and is one of 17 Premier Members of the x402 Foundation; Mastercard is also a Premier Member[^19] yet **publishes no agentic-payments data at all** — no dashboard, no transaction counts, its x402 position expressed only through quotes inside Linux Foundation releases.[^20]
7. **Thesis instrument status** ("x402 success is not yet priced in"): the surprise index reads **negative on counts, mildly positive on value**.[^10] The confirmation pattern — counts and value surprising positive together, plus vendor de-concentration — **has not fired**. Run-rate of the indexer-measured economy: **~$10.17M/year**;[^1] the Visa-adjusted cumulative over 14 months is $15.0M.[^3]

## 2. Measurement infrastructure

Pipeline (operational since 2026-07-16): three collectors (Dune per-facilitator dailies;[^7] x402scan structured snapshots;[^1] npm counts[^9]) → scrub layer (ping-storm flag: >95% sub-cent transfers ∧ <5 unique buyers per day×facilitator) → parquet in object storage → weekly statsforecast vintages (SeasonalNaive / AutoARIMA / AutoETS / Theta; rolling-origin CV; winner per series; 28-day quantile forecasts) → surprise index.[^10]

Marginal cost of the entire apparatus: **€6.49/month** (one small VPS) + ~22 Dune credits/day inside the free tier + one Firecrawl scrape/day. Zero paid model APIs.

Declared limits: `LENS.ONCHAIN` catalogs are stale (§5, fix queued); `LENS.SCAN` indexes only registered sellers and displays mixed windows (30d on the home page; a site-labeled "Past 24 Hours" window on /facilitators and /networks — confirmed live, and highly volatile day to day);[^1] `LENS.EXT` relays x402.org's self-reported stats via CoinDesk;[^2] `LENS.ADJ` methodologies are proprietary (Artemis heuristics)[^3] or one-shot (arXiv snapshot through ~March 2026).[^5]

## 3. Macro state — the denominator problem, on two clocks

Every series in this report now sits on one of exactly two windows: **Clock A, stock** (cumulative since each counter's genesis) and **Clock B, flow** (trailing 30 days). Anything finer — the indexer's "Past 24 Hours" facilitator and network pages — is treated as a volatility exhibit, never a comparison basis.

**Clock A — cumulative, since day one:**

| Series | Genesis → as-of | Transactions | USD volume | Method |
|---|---|---|---|---|
| x402scan indexer, All Time[^1] | ~May 2025 → live 2026-07-18 | **195M** | $52.31M | indexed facilitators only; 843.33K buyers / 226K sellers |
| Artemis raw[^3] | May 2025 → 2026-04-21 | 178.3M | **$135.7M** | all facilitator-adjacent on-chain activity |
| Dune community cumulative[^17] | genesis → ~2026-06-21 | 153.3M | $40.87M | facilitator-attributed transfers, ecosystem-wide |
| Dune 96-address registry, by chain[^15] | genesis → ~2026-07-14 | ≈144.0M | — | Base 72.43M · Solana 47.87M · Polygon 22.69M |
| arXiv forensic[^5] | 280 days → ~Mar 2026 | 136.7M | $44.1M raw | independent flow bounded **$0.19M–$20.3M** |
| Our on-chain slice[^7] | Aug 2025 → 2026-07-16 | 119.7M | $39.66M | stale catalog — recent months undercounted |
| Visa × Artemis adjusted[^3] | May 2025 → 2026-04-21 | 109.6M | **$15.0M** | wash/test excluded (~89% of raw volume) |
| DefiLlama adapter[^14] | genesis → live 2026-07-18 | — | $31.46M | volume-only; Base $22.21M / Solana $9.03M |

Cumulative transaction counts span **110M to 195M** and cumulative volume **$15M to $135.7M** depending on who counts and how — with the academically defensible independent-flow floor at $0.19M.[^5] **The spread itself is the finding**: raw settlement counts measure *manufacturability*, not adoption — the arXiv authors' phrase,[^5] Visa's 89% exclusion,[^3] and x402gle's ~93% wash share[^11] all say the same thing from independent methods.

**Clock B — trailing 30-day flow:**

| Series | As-of | Transactions | USD volume | Buyers / sellers |
|---|---|---|---|---|
| x402scan indexer[^1] | live 2026-07-18 | 17.28M | $825.26K | 47.17K / 62K |
| x402.org self-published[^2] | static page, authored ~2026-06-24 | 75.41M | $24.24M | 94.06K / 22K |
| Our on-chain slice[^7] | 30d ending 2026-07-16 | 496.8K | $89.2K | catalog-limited (~10.5% coverage) |

**And because a 30-day window printed in text is stale the day it ships, Clock B is also a live instrument.** The panel below is regenerated by our pipeline every morning at 06:10 UTC from a fresh, cache-disabled read of the indexer plus our own on-chain slice — this image updates itself daily, in this post and in every syndicated mirror, with no republishing:[^10]

![LIVE — x402, last 30 days, self-updating daily](https://gokhan.vc/x402-live/fig-live-30d.svg)

Agents: the same panel as machine-readable JSON, same cadence, at `https://gokhan.vc/x402-live/latest-30d.json`.

**A provenance discovery, from reading x402.org directly instead of via press relay**: the protocol's own "Last 30 Days" panel — the most-quoted numbers in the ecosystem — is **hard-coded static text in the page markup, manually edited** (the markup's authoring timestamp decodes to ~2026-06-24). It is a hand-updated snapshot of an unstated edit date, not a live counter, and the site publishes no cumulative figure at all.[^2]

Whichever lens, the shape agrees: tens of millions of machine-initiated payments, hundreds of thousands of buyers against tens of thousands of sellers (843.33K vs 226K on the indexer's all-time clock;[^1] 422K vs ~5,300 wash-adjusted[^3]), sub-dollar tickets ($0.048 indexer 30d mean;[^1] $0.30 Artemis live;[^4] ~$0.32 self-reported[^2]).

Historical arc: peak day **2025-11-15 at 3,785,401 transfers** in our catalog slice alone[^7] — the $PING farming era, which Chainalysis logs as a 10,000%+ single-week transaction surge.[^6] The Visa-adjusted series puts the same peak month at 38M transactions / $5.15M adjusted.[^3] Our slice has since collapsed −80.6% MoM in transfers (324,981 → 62,905)[^7] — a compound of wash decay (real) and catalog decay (measurement artifact, §5).

**Payment-size structure** (TWZRD scrubbed Solana sample, cumulative, n=1,506,245 payments / $409,308):[^8]

| Bucket | Count share | Value share |
|---|---|---|
| < $0.01 | 28.50% | 0.17% |
| $0.01–0.10 | 50.02% | 6.86% |
| $0.10–1 | 13.52% | 20.52% |
| $1–10 | 7.85% | **53.61%** |
| $10+ | 0.11% | 18.84% |

**78.5% of payments sit below $0.10 and carry 7.0% of value; the $1–10 bucket is the economic center of gravity.**[^8] Independently, Chainalysis reports the $1+ volume share rose 49% → 95% from early 2025 to early 2026, and the 10¢–$1 band collapsed 46% → 4%.[^6] All lenses converge here: micro-pings are noise; small-but-real payments are the economy.

![FIG. 02 — payment size distribution](https://gokhan.vc/x402-report/fig-02-payment-size-distribution.svg)

## 4. Networks: Base vs Solana

The lenses invert each other; both inversions are informative.

| | Base | Solana |
|---|---|---|
| Indexer, past 24h, live[^1] tx | 206,609 (97.6% of tx) | 5,043 (2.4%) |
| Indexer, past 24h, live[^1] volume | $19.26K (97.1% of vol) | $572 (2.9%) |
| On-chain, 30d ending 2026-07-16[^7] tx | 62,905 | **433,872** (+381% MoM) |
| On-chain, 30d ending 2026-07-16[^7] volume | $10.89K | **$78.28K** (+55% MoM) |

(The site labels the facilitators/networks window "Past 24 Hours", and it swings violently: a ~2026-07-15 sample of the same page showed Base 224,221 tx / $33.14K vs Solana 35,840 / $2.99K — Solana's daily scan-lens share collapsed from 13.8% to 2.4% of transactions in two days.[^1] Single-day tables from this page are weather, not climate — one day after our live capture, the same page read Base 76.7% / Solana 23.3%.[^1])

The adjusted lens breaks the tie: Base carries **~90% of adjusted transactions and 93% of adjusted volume** cumulatively.[^3] Artemis's flagging methodology found **86% of Solana payment activity inorganic** as of January 2026.[^22] Joint reading: **Base carries the economy; Solana's growth claim rests on our 30-day on-chain lens** (+381% MoM in a PayAI-signer slice[^7]) and on wash-heavy raw counts — hold both facts, weight the adjusted one.

## 5. Facilitators — the settlement layer

Site-labeled "Past 24 Hours" window, live 2026-07-17 14:42 UTC, dual-lens verified; window totals 211,652 tx / $19.83K:[^1]

| Facilitator | Tx (24h) | Volume | Sellers / buyers |
|---|---|---|---|
| Coinbase (CDP) | 196,720 | $12.67K | 3,823 / 1,919 |
| FluxA | 13,020 | $3.02K | 485 / 844 |
| PayAI | 3,616 | $515.85 | 65 / 115 |
| Primer | 202 | $52.74 | 10 / 35 |
| **Meridian** | **191** | **$3.56K** | 6 / 6 |
| Polymer | 187 | $18.70 | 1 / 1 |
| AnySpend | 139 | $233.00 | 1 / 75 |
| Mogami | 105 | $0.52 | 2 / 3 |

(The ~2026-07-15 sample additionally showed Dexter at 25,131 tx / $1.04K on Solana, Heurist 917, Cascade 355 — all three absent from the live 2026-07-17 window.[^1] A facilitator roster that churns within days is itself the finding.)

![FIG. 04 — facilitators, transactions vs volume](https://gokhan.vc/x402-report/fig-04-facilitators.svg)

Findings:

- **Coinbase CDP is the default clearing house**: 92.9% of window transactions and the widest seller base (3,823 in the live window)[^1] — and the ecosystem's canonical seller registry is Coinbase-operated too: the x402 Bazaar discovery API lists **25,560 resources** as free unauthenticated JSON.[^12] One dominant rail, and its dominance strengthened between our two samples (80.2% → 92.9%).
- **Meridian is the structural outlier**: $3.56K on 191 transactions in the live window = **$18.64 mean ticket, ~390× the ecosystem mean** of $0.048 (the 07-15 sample showed $26.45 / 568×).[^1] Real invoices, not micro-pings, are settling through x402. High-ticket facilitation is emerging as a distinct niche.
- **FluxA (Base, now #2 by transactions) and Dexter (Solana, already gone from the live window again) are fast entrants** absent from all community catalogs.[^1] Dexter separately claims >60% of lifetime Solana x402 volume and operates its own explorer, which publishes per-facilitator **wash percentages** — ~93% wash in its 24h window — the one metric every other tracker avoids.[^11] Facilitator addresses churn in weeks — the roster itself churns in days. Consequence, quantified: `LENS.ONCHAIN` captures **10.5%** of `LENS.SCAN` volume.[^7]
- Within our stable-address slice (Base, 30d), leaders were Anyspend ($5.4K), PayAI ($4.1K), Thirdweb ($905).[^7]

## 6. Vendors — who earns

30-day revenue, live 2026-07-17, dual-lens verified:[^1]

| Vendor | 30d revenue | Sells |
|---|---|---|
| **BlockRun** | **$177.26K** | AI model routing, payment built in — **14.48M transactions in 30 days (82% of the entire measured economy's count) from ~1.13K buyers**; publishes its own public stats endpoint[^24] |
| dTelecom | $18.75K | WebRTC / STT / TTS for agents (DePIN) — 8.91K tx / 24 buyers |
| StableEnrich | $1.77K | Enrichment meta-API (FullEnrich, Exa, Firecrawl, Serper, …) — 47.08K tx / 554 buyers |
| sol.blockrun.ai | $1.27K | BlockRun's Solana surface |
| twit.sh | $621 | Real-time X/Twitter data for agents — 101.61K tx / 120 buyers |
| agentutility | $589 | 762-endpoint pay-per-call catalog — 25.89K tx / 229 buyers |
| JarvisClaw | $560 | OpenAI-compatible AI gateway |
| Nansen AI | $131 | On-chain trading intelligence |
| Otto AI | $105 | 74 market-intel / DeFi / creative services — 65.28K tx / 559 buyers |
| OneSource | $73 | Ethereum RPC for agents |

![FIG. 03 — top sellers by 30-day revenue](https://gokhan.vc/x402-report/fig-03-vendor-revenue.svg)

Structure:

- **Extreme concentration, on both sides of the market.** Top vendor = 20.9% of measured volume and **82% of measured transaction count**; #1 out-earns #2 by 9.5×.[^1] On the buyer side, the top 1% of adjusted buyers carry ~90% of adjusted volume, and the top 0.02% carry ~48%.[^3] The median registered seller earns ≈ nothing — of 25,560 registered resources,[^12] roughly 46.7% may already be dead per 21Shares' forensic sweep.[^16] Power-law, pre-consolidation.
- **Two demand shapes.** Industrial deep-usage (BlockRun: 14.48M tx from ~1.13K buyers — a small fleet of agents hammering one rail) vs breadth plays (Otto 559 buyers, StableEnrich 554) vs micro-niches (dTelecom: $18.75K from just 24 buyers).[^1]
- **x402 is a billing layer over the existing API economy**, not a parallel service universe: top vendors resell Exa/Firecrawl/OpenAI-compatible inference behind a BYO-wallet meter.[^1]

## 7. Sectors — what the money buys

Classification of the top-20 marketplace servers + the ecosystem registry:[^1][^12]

| Sector | Representative vendors | Revenue evidence |
|---|---|---|
| AI inference & routing | BlockRun, JarvisClaw, claw402, 2s, Daydreams Router | **Dominant: ~$179K/30d** |
| Speech / media generation | dTelecom, StableStudio | #2: $18.75K+ |
| Trading & on-chain intel | Otto, Nansen, SniperX, Deepnets, Questflow, SolEnrich | Most crowded by vendor count; small revenue each |
| Data enrichment & search | StableEnrich, Exa, Firecrawl endpoints | Mid-tail: ~$1.8K |
| Social data | twit.sh, StableSocial | Small, real: $600+ |
| Chain data / RPC | OneSource, x402node, Net, BaseHub | Utility tickets |
| Payments / agent infra | Syra, Polymer Prove, MCPay, Latinum, Loyal Spark | Monetizes indirectly |

Registry composition (42–44 projects rendered live 2026-07-17; a ~07-15 cached extraction showed 61 — the page lazy-loads and categories overlap, so treat composition as approximate): Infrastructure & Tooling 14, Services/Endpoints 16, Client-Side 7, Facilitators 5, Learning 4[^1] — **roughly a third of the registered ecosystem is picks-and-shovels** serving an end-demand that is one routing vendor deep.

Sectoral law observed so far: **agents pay first for compute (inference), then for perception (data, search, social), then for action (trading, telecom) — in that revenue order.** Everything monetizing well is an input to running more agents.

## 8. Developer funnel

Verified against the npm registry API, twice, figures exact:[^9]

| Package | Last week | WoW | Month |
|---|---|---|---|
| `x402` (core) | 301,786 | **+6%** | 1,205,461 |
| `@coinbase/x402` | 42,020 | **−39%** | 201,438 |
| `x402-fetch` | 18,769 | **−42%** | 88,351 |
| `x402-axios` | 7,298 | +14% | 27,820 |
| `x402-express` | 3,068 | −3% | 14,168 |

![FIG. 06 — npm week-over-week](https://gokhan.vc/x402-report/fig-06-npm-funnel.svg)

Reading: a stable ~1.2M/month core with sharply contracting client helpers, simultaneous with gateway-vendor revenue growth (§6), indicates **consolidation into hosted rails** rather than direct protocol integration. Bullish for rail operators; bearish for a decentralized seller base.

## 9. Forecast layer and the surprise index

**Backtest** (rolling-origin CV, h=14; rMAE vs SeasonalNaive, <1 beats baseline):[^10]

| Series | Winner | rMAE |
|---|---|---|
| base_transfers | Theta | 0.46 |
| base_transfers_scrubbed | Theta | 0.44 |
| base_volume_usd | **SeasonalNaive** | 1.00 |
| solana_transfers | Theta | 0.56 |
| solana_transfers_scrubbed | Theta | 0.56 |
| solana_volume_usd | Theta | 0.67 |

Classical baselines halve naive error on counts; **Base dollar volume remains unforecastable beyond naive** (single-seller spike-driven). This table is the admission bar for any foundation model (Chronos-2, Moirai-2 — queued) in the same harness.

![FIG. 01 — Base daily transfers with forecast](https://gokhan.vc/x402-report/fig-01-base-transfers-forecast.svg)

**Surprise index** (realized Jul 3–16 ÷ forecast frozen Jul 2):[^10]

| Series | Realized/forecast | z |
|---|---|---|
| Base transfers | **0.61×** | −0.0¹ |
| Base volume | **1.12×** | +0.0¹ |
| Solana transfers | **0.62×** | −1.0 (last day −1.86) |
| Solana volume | **1.06×** | +0.05 |

¹ z ≈ 0 despite large ratio miss because 80% intervals on the Base series are extremely wide (fig. 01); the ratio is the informative statistic there.

![FIG. 05 — surprise index](https://gokhan.vc/x402-report/fig-05-surprise-index.svg)

Interpretation: **quantity undershoots, value overshoots** — wash evaporating faster than the model expected, paid usage slightly ahead of it. Artemis's live terminal reads the same contraction at ecosystem scale: 30-day transactions −96.5%, volume −89%.[^4] Automated weekly vintages begin 2026-07-20.

## 10. Assessment and watchlist

**Frame.** The indexer-measured run-rate is **$10.17M/year**;[^1] the card-network-endorsed adjusted cumulative is **$15.0M over ~14 months**;[^3] the academically defensible independent-flow bound is **$0.19M–$20.3M**.[^5] Against that: Visa, Mastercard and Ripple joined the standard the week of publication,[^2][^19] and the Foundation now has 40 member organizations.[^19] The narrative-to-GDP gap is enormous, and cuts both ways. Current evidence: a working mechanism; one proven killer app (paying for inference); one dominant clearing rail; genuinely improving payment quality; extreme concentration on both market sides; **no inflection in the data yet**.

**Confirmation pattern for the thesis** — the pipeline watches these automatically:[^10]

1. Count *and* value surprise positive together for ≥2 consecutive weekly vintages.
2. BlockRun share < ~15% while total volume rises (demand broadening beyond inference).
3. Ecosystem median ticket climbing through $1 while counts recover (Meridian-style flows becoming a sector).
4. npm client-lib contraction reversing, or gateway *buyer* counts (not request counts) compounding.
5. Continued facilitator entry (FluxA/Dexter-class) without Coinbase-share collapse — rail competition without rail fragility.
6. The **adjusted** series turning: Artemis's live 30-day transaction change recovering from −96.5% while the adjusted ticket holds above $0.30.[^4]

**Queued pipeline upgrades:** facilitator catalogs regenerated from x402scan attribution and the 96-row community registry;[^15] discovery-feed differ across the Bazaar,[^12] PayAI[^13] and Dexter registries; an authenticity scrub layer implementing the arXiv payment-graph decomposition[^5] and 21Shares' campaign-stripping tests,[^16] benchmarked against x402gle's wash series;[^11] DefiLlama[^14] and BlockRun[^24] pulls as triangulation series; Chronos-2/Moirai-2 vs the §9 bar.

## 11. The measurement landscape (who else counts, and how)

A due-diligence sweep on 2026-07-17 verified 21 live tracking resources beyond x402scan and x402.org; the full catalog is a companion document.[^23] The structural summary:

- **Visa** operates no dashboard itself, but co-funds the only public wash-adjusted apparatus: the July-2026 report[^3] and Artemis's continuously updating terminal — the x402 asset page and the "Real vs. Gamed" transaction chart, both free.[^4][^21]
- **Mastercard**, a Premier Member of the x402 Foundation like Visa,[^19] publishes **no agentic-payments data of any kind** — no dashboard, no transaction counts, no report figures; its x402 position exists as quotes inside Linux Foundation releases and a June 2026 AP4M product launch with 32 named participants and zero metrics.[^20]
- **Cloudflare** is builder-and-governor, not yet monetizer: x402 v2 fully productized in the Workers/Agents SDK, Pay Per Crawl still a private-beta "Pay Per Use" experiment (Stripe rails, Cloudflare as merchant of record), NET Dollar unlaunched ten months after announcement, and **zero payment-volume telemetry published** — only crawler-behavior data on Radar.[^18]
- **The best machine-readable feeds are the facilitators' own**: Coinbase's Bazaar discovery API (25,560 resources),[^12] PayAI's mirror feed (24,094 resources, 11 networks),[^13] Dexter's feed plus x402gle's wash-percentage explorer,[^11] and BlockRun's one-call stats endpoint.[^24]
- **The open niches nobody measures**: off-chain x402 settlement (Cloudflare's Stripe-settled deferred scheme), longitudinal seller-registry churn, payer-to-runtime attribution, wash-excluded revenue leaderboards, cross-rail (x402 vs MPP vs APP) share, facilitator SLA/uptime, and protocol-version adoption.[^23]

## Errata & verification — revision v2 (2026-07-17)

After first publication, every external number was re-verified against primary sources: x402scan re-scraped with Firecrawl's cache disabled AND independently rendered in a real browser via Browserbase (the two lenses agreed exactly, and both matched our own pipeline's 06:10 UTC snapshot);[^1] the CoinDesk and Chainalysis articles were crawled and quoted directly;[^2][^6] npm was re-pulled (15/15 figures exact).[^9] Corrections applied since v1:

- **Provenance**: the original LENS.SCAN capture was unknowingly served from a Firecrawl cache of ~2026-07-15 while labeled "retrieved 2026-07-17". All LENS.SCAN values above are live dual-lens readings from 2026-07-17 14:42 UTC. (Pipeline fixed: cache disabled + a stat-label pairing bug corrected.)
- **Headline 30d**: $870.24K / 18.68M tx / 52.4K buyers / 55K sellers → **$847.80K / 17.67M / 48.24K / 61K**.[^1]
- **Attribution**: the 75M / $24M / 94K / 22K figures are CoinDesk relaying **x402.org's self-reported homepage stats** (verified verbatim) — not Chainalysis.[^2] A "$0.00025 Solana fee" figure appeared in neither source and was withdrawn.
- **Registry**: 61 → 42–44 rendered live, with overlapping categories.[^1]
- **Rev.3 additions**: the five-lens denominator table (§3) with the Visa × Artemis adjusted series[^3] and arXiv forensic bounds;[^5] the card-network measurement split (§1.6, §11); Artemis live-terminal corroboration of the contraction;[^4] the full superscript citation apparatus.
- **Rev.4 additions (2026-07-18)**: §3 re-cut onto **two clocks** — cumulative-since-genesis for every series (including the indexer's All-Time view, 195M tx / $52.31M, captured by driving its window selector in a real browser[^1]) and trailing-30-day flow; the x402.org provenance discovery (its “Last 30 Days” panel is hand-edited static page text, authored ~2026-06-24, no cumulative published[^2]); fresh cumulative rows from the Dune boards[^15][^17] and DefiLlama;[^14] our own slice's since-day-one totals (119.7M tx / $39.66M[^7]); the 24-hour tables demoted to volatility exhibits.

The newsletter dispatched before v2 carried v1 headline numbers; the deltas are rolling-window drift and change no conclusion.

---

## A. Canonical data appendix (machine-readable)

Authoritative over prose. Units: USD unless noted; windows as stated.

```json
{
  "asof": "2026-07-18 (rev.4)",
  "verification": {
    "scan_method": "Firecrawl maxAge=0 + Browserbase real-browser CDP session (30dc699d), 2026-07-17 14:42 UTC; lens agreement: exact",
    "primary_articles": {"coindesk_2026_07_15": "4/4 figures verified verbatim; numbers are x402.org self-reported homepage stats", "chainalysis_2026_06_03": "$1+ share 49%→95%, 10c-$1 46%→4%, 100M milestone verified verbatim", "visa_artemis_2026_07": "article + 28pp PDF fetched; raw $135.7M/178.3M vs adjusted $15.0M/109.6M confirmed", "arxiv_2607_12575": "submitted 2026-07-14; 136.7M settlements, 21.2% fictitious, 63.8% internal, independent bound $0.19M-$20.3M"},
    "npm": "15/15 figures exact",
    "card_networks": {"visa": "no own dashboard; funds Artemis report + live terminal", "mastercard": "no data products at all; press/marketing only"}
  },
  "lenses": {
    "scan_30d": {"volume_usd": 847800, "tx": 17670000, "buyers": 48240, "sellers": 61000, "mean_ticket_usd": 0.048},
    "ext_30d": {"source": "CoinDesk 2026-07-15, relaying x402.org self-reported homepage stats", "tx": 75000000, "volume_usd": 24000000, "buyers": 94000, "sellers": 22000},
    "adj_cumulative": {"source": "Visa x Artemis, data as of 2026-04-21", "raw_tx": 178300000, "raw_volume_usd": 135700000, "adjusted_tx": 109600000, "adjusted_volume_usd": 15000000, "adjusted_buyers": 422000, "adjusted_sellers": 5300, "top1pct_buyers_volume_share": 0.90, "base_share_adjusted_tx": 0.90},
    "adj_live": {"source": "Artemis Terminal 2026-07-17", "tx_24h": 35094, "volume_24h_usd": 8860, "avg_ticket_usd": 0.30, "tx_30d_change": -0.9652, "volume_30d_change": -0.8899},
    "forensic_bound": {"source": "arXiv:2607.12575", "raw_settlements": 136700000, "raw_volume_usd": 44100000, "fictitious_share": 0.212, "internal_share": 0.638, "independent_value_usd": [187861, 20260000]},
    "onchain_30d": {
      "window_end": "2026-07-16",
      "base": {"tx": 62905, "volume_usd": 10892, "tx_prev30": 324981, "volume_prev30": 50940},
      "solana": {"tx": 433872, "volume_usd": 78279, "tx_prev30": 90140, "volume_prev30": 50465},
      "coverage_vs_scan": 0.105, "base_peak_day": {"date": "2025-11-15", "tx": 3785401}
    }
  },
  "size_buckets_solana_twzrd": {
    "n_payments": 1506245, "volume_usd": 409308,
    "buckets": [
      {"range": "<0.01", "count_share": 0.285, "value_share": 0.0017},
      {"range": "0.01-0.10", "count_share": 0.5002, "value_share": 0.0686},
      {"range": "0.10-1", "count_share": 0.1352, "value_share": 0.2052},
      {"range": "1-10", "count_share": 0.0785, "value_share": 0.5361},
      {"range": "10+", "count_share": 0.0011, "value_share": 0.1884}
    ]
  },
  "facilitators_past_24h_live": {"window_total": {"tx": 211652, "volume_usd": 19830},
    "rows": [["Coinbase", 196720, 12670], ["FluxA", 13020, 3020], ["PayAI", 3616, 515.85], ["Primer", 202, 52.74], ["Meridian", 191, 3560], ["Polymer", 187, 18.70], ["AnySpend", 139, 233], ["Mogami", 105, 0.52]],
    "meridian_mean_ticket": 18.64, "meridian_vs_eco_mean": 390, "coinbase_tx_share": 0.929,
    "sample_2026_07_15": {"window_total": {"tx": 260097, "volume_usd": 36020}, "coinbase_tx_share": 0.802, "departed_since": ["Dexter", "Heurist", "Cascade"]}},
  "networks_past_24h_live": {"base_tx": 206609, "base_vol_usd": 19260, "solana_tx": 5043, "solana_vol_usd": 572, "base_tx_share": 0.976},
  "vendors_30d": [["BlockRun", 177260], ["dTelecom", 18750], ["StableEnrich", 1770], ["sol.blockrun.ai", 1270], ["twit.sh", 621], ["agentutility", 589], ["JarvisClaw", 560], ["Nansen AI", 131], ["Otto AI", 105], ["OneSource", 73]],
  "vendor_concentration": {"top1_volume_share": 0.209, "top1_tx_share": 0.82, "top1_tx": 14480000, "top1_buyers": 1130, "top1_vs_top2": 9.5, "adjusted_top1pct_buyers_volume_share": 0.90},
  "registries": {"cdp_bazaar_resources": 25560, "payai_resources": 24094, "dead_services_share_21shares": 0.467},
  "npm_wow": {"x402": 1.06, "x402-axios": 1.14, "x402-express": 0.97, "@coinbase/x402": 0.61, "x402-fetch": 0.58, "x402_month_total": 1205461},
  "backtest_rmae_vs_snaive": {"base_transfers": 0.4573, "base_transfers_scrubbed": 0.4376, "base_volume_usd": 1.0, "solana_transfers": 0.5618, "solana_transfers_scrubbed": 0.5635, "solana_volume_usd": 0.6674},
  "surprise_14d": {"base_transfers": 0.607, "base_volume": 1.118, "solana_transfers": 0.618, "solana_volume": 1.063, "solana_transfers_mean_z": -1.0},
  "ecosystem_registry": {"rendered_live": "42-44", "cached_0715_extraction": 61, "note": "page lazy-loads; categories overlap"},
  "run_rate_usd_yr": 10170000,
  "infra_cost_eur_month": 6.49,
  "clock_a_cumulative": {
    "x402scan_alltime_live": {"tx": 195000000, "volume_usd": 52310000, "buyers": 843330, "sellers": 226000, "asof": "2026-07-18, real-browser"},
    "artemis_raw": {"tx": 178300000, "volume_usd": 135700000, "asof": "2026-04-21"},
    "dune_thechriscen": {"tx": 153312059, "volume_usd": 40872291, "board_refresh": "~2026-06-21"},
    "dune_hashed_by_chain": {"tx_total": 144003493, "base": 72430301, "solana": 47873448, "polygon": 22694090, "board_refresh": "~2026-07-14"},
    "arxiv_raw": {"tx": 136700000, "volume_usd": 44100000, "independent_usd": [187861, 20260000]},
    "our_slice": {"tx": 119667480, "volume_usd": 39662922, "span": "2025-08-01..2026-07-16"},
    "visa_artemis_adjusted": {"tx": 109600000, "volume_usd": 15000000, "asof": "2026-04-21"},
    "defillama": {"volume_usd": 31460000, "base": 22210000, "solana": 9030000, "asof": "2026-07-18"}
  },
  "clock_b_flow_30d": {
    "x402scan_live": {"tx": 17280000, "volume_usd": 825260, "buyers": 47170, "sellers": 62000, "asof": "2026-07-18"},
    "x402org_static": {"tx": 75410000, "volume_usd": 24240000, "buyers": 94060, "sellers": 22000, "page_authored": "~2026-06-24"},
    "our_slice": {"tx": 496777, "volume_usd": 89171, "window_end": "2026-07-16"}
  },
  "x402org_static_panel": {"finding": "Last-30-Days stats are hard-coded, manually edited page text (authored ~2026-06-24); no cumulative published on the site"},
  "dune_queries": {"base_daily": 8001312, "solana_daily_windowed": 8009658, "size_buckets": 8001313}
}
```

**Provenance (rev.3):** every superscript note below states the source, its operator, and how/when it was verified. All LENS.SCAN values were read live by two independent methods in exact agreement; all press-relayed figures were verified against the primary articles; the Visa × Artemis PDF was downloaded and read; the pipeline's own series are reproducible from the listed Dune queries and object-storage artifacts.

[^1]: **x402scan.com** (ecosystem indexer, operator x402scan) — dual-lens verified live 2026-07-17 14:42 UTC: Firecrawl scrape with `maxAge: 0` (cache disabled) AND an independent Browserbase real-browser session (CDP, session 30dc699d); the two methods agreed exactly on every figure. Home page = "Past 30 Days" window; /facilitators and /networks = site-labeled "Past 24 Hours". The ~2026-07-15 comparison sample is our v1 capture, retro-dated after the cache was discovered. On 2026-07-18 a second real-browser session (9f5bee9d) drove the stats-panel window selector (options: Past 24 Hours / 7 / 15 / 30 Days / All Time): **All Time = 195M tx / $52.31M / 843.33K buyers / 226K sellers**; the same session read the 30d window at 17.28M / $825.26K / 47.17K / 62K, and the 24h networks split at Base 76.7% / Solana 23.3%.

[^2]: **CoinDesk**, "Visa, Mastercard and Ripple join the standard letting AI agents pay in stablecoins" (2026-07-15) — primary article crawled and quoted 2026-07-17. The 75M tx / $24M / 94K buyers / 22K sellers figures are x402.org's self-reported homepage stats, which CoinDesk states explicitly; avg ticket "about 32 cents." Read directly on 2026-07-18: x402.org (an LF Projects site) publishes ONLY a "Last 30 Days" panel — 75.41M tx / $24.24M / 94.06K buyers / 22K sellers — as hard-coded static text in the page markup (authoring timestamp ~2026-06-24); a manually updated snapshot, not a live counter, with no cumulative figure anywhere on the site.

[^3]: **Visa × Artemis, "Agentic Payments from the Ground Up"** (visa.com thought-leadership article, updated 2026-07-14, + 28-page PDF, July 2026; all data as of 2026-04-21) — both fetched and read 2026-07-17. Raw cumulative x402: $135.7M / 178.3M tx; adjusted (proprietary Artemis wash/test-exclusion heuristics): $15.0M / 109.6M tx; 422K+ adjusted buyers, ~5,300 adjusted sellers; top 1% of buyers ≈ 90% of adjusted volume, top 0.02% ≈ 48%; Base ≈ 90% of adjusted tx / 93% of volume; Nov-2025 peak 38M tx / $5.15M adjusted.

[^4]: **Artemis Terminal, x402 asset page** (app.artemisanalytics.com/asset/x402, operator Artemis Analytics, Visa-commissioned research partner) — live dashboard, free without login, verified 2026-07-17 (page timestamp same-day 11:30 ET): 24h tx 35,094 / volume $8,860 / avg ticket $0.30; 30-day change: transactions −96.52%, volume −88.99%; cumulative 840.9K buyers / 9.1K sellers.

[^5]: **arXiv:2607.12575, "How Agentic Is Agentic Commerce?"** (Zhejiang Univ. / CityU HK, submitted 2026-07-14, CC-BY 4.0) — first population-scale forensic measurement of x402 on Base: 136.7M settlements / $44.1M over 280 days; 21.2% fictitious, 63.8% internal within linked payment clusters; genuinely independent value bounded $187,861–$20.26M; all Gini > 0.98. Verified live 2026-07-17.

[^6]: **Chainalysis, "Agentic Payments Cross the Threshold: Inside x402's Path to Meaningful Adoption"** (blog, 2026-06-03) — primary article crawled and quoted 2026-07-17: 100M+ cumulative transactions through Q1 2026; $1+ share of volume 49% (early 2025) → 95% (early 2026); 10¢–$1 band 46% → 4%; PING 10,000%+ single-week surge; wallet-demographic series.

[^7]: **Our Dune queries** (8001312 Base daily per-facilitator; 8009658 Solana daily, windowed; catalogs forked 2026-07-16 from community queries 6158127/6165774, known stale) — reproducible via the Dune API; raw and curated parquet in the pipeline's object storage. Windows ending 2026-07-16.

[^8]: **TWZRD, "x402 on Solana (Official)"** (dune.com/twzrd_analyst, facilitator-identity attribution methodology) — scrub-corrected size-bucket dataset ingested via our Dune query 8001313; board verified live 2026-07-17 (widgets refreshed within minutes).

[^9]: **npm registry API** (api.npmjs.org, downloads/range endpoints) — pulled directly 2026-07-16 and re-verified 2026-07-17; all 15 figures matched exactly across both pulls.

[^10]: **x402-econ pipeline** (our infrastructure): statsforecast baselines with rolling-origin cross-validation, weekly frozen forecast vintages, surprise index = realized ÷ prior frozen forecast. Repo gokhan-vc/x402-econ; artifacts in object storage (`forecasts/vintage-*.parquet`); backtest and surprise tables reproducible from the appendix queries.

[^11]: **x402gle** (x402gle.com, operator Dexter Labs) — real-time cross-facilitator explorer publishing per-facilitator wash-trading percentages (~93% wash in its 24h window at verification); 31-facilitator leaderboard. Verified live 2026-07-17 ("Active 37s ago" row labels).

[^12]: **Coinbase CDP x402 Bazaar discovery API** (api.cdp.coinbase.com/platform/v2/x402/discovery/resources) — free unauthenticated JSON; 25,560 discoverable resources with payment terms and per-item lastUpdated at verification 2026-07-17. The upstream registry x402scan renders.

[^13]: **PayAI facilitator discovery feed** (facilitator.payai.network/discovery/resources + /supported) — free JSON; 24,094 resources, 11 supported networks at verification 2026-07-17 (first item lastUpdated same-day).

[^14]: **DefiLlama x402 protocol page** (defillama.com/protocol/x402) — adapter-based daily settlement volume across 10 chains; free API/CSV. Re-read 2026-07-18: **$31.46M cumulative** — Base $22.21M, Solana $9.03M, BSC $213K; volume-only (no transaction counts).

[^15]: **Hashed, "x402 Analytics"** (dune.com/hashed_official/x402-analytics) — cross-chain facilitator board with a maintained 96-row facilitator-address registry across 8+ chains; widgets auto-refreshed within 9h at verification 2026-07-17. Cumulative transactions by chain (board refresh ~2026-07-14): Base 72.43M, Solana 47.87M, Polygon 22.69M, BNB 1.00M — ≈144.0M across 12 chains.

[^16]: **21Shares Research, "Agentic Economy On-Chain Tracker"** (dune.com/21sharesresearch) — forensic decomposition dashboard (June 2026): one-signer campaign-stripping, gas-payer tests, 46.7% dead-services estimate, x402-vs-MPP comparison. Verified live 2026-07-17.

[^17]: **Dune community cumulative boards** — official Dune-team "x402 Facilitators" (dune.com/dune/x402-facilitators: per-facilitator cumulative attribution) and thechriscen's "x402 Payment Analytics" (153.3M tx / $40.87M cumulative at verification) — the series most press cumulative citations trace to. Verified live 2026-07-17; re-read 2026-07-18: 153,312,059 tx / $40,872,291 (board refresh ~2026-06-21). The Dune-team facilitator table (refresh ~2026-06-30) sums ≈94.1M tx / ≈$30.4M, Base+Polygon only.

[^18]: **Cloudflare surfaces** — AI Crawl Control changelog (developers.cloudflare.com/ai-crawl-control/changelog: Pay Per Crawl private beta, reframed "Pay Per Use" 2026-07-01), Radar AI Insights (crawler behavior only), Agents SDK x402 v2 support, netdollar.cloudflare.com (announced 2025-09-25, unlaunched at verification 2026-07-17). No payment-volume telemetry anywhere.

[^19]: **Linux Foundation x402 Foundation releases** (2026-04-02 intent; 2026-07-14 operational launch) — 40 member organizations: 17 Premier (incl. Visa, Mastercard, Cloudflare, Coinbase), 18 General, 5 Associate. Both releases fetched 2026-07-17.

[^20]: **Mastercard corpus** (mastercard.com newsroom, Agent Pay / AP4M program pages, Signals reports) — verified 2026-07-17: AP4M launch release 2026-06-10 names 32 participants, zero metrics; no Mastercard-published agentic transaction data exists; its only internal metric anywhere in the corpus is "one in three of Mastercard's services is powered by AI"; no own press release on joining x402.

[^21]: **Artemis chart-builder 10063, "x402 Transactions: Real vs. Gamed"** (app.artemisanalytics.com/chart-builder/10063) — the public interactive face of the wash-flagging methodology; daily series, free to view. Verified live 2026-07-17.

[^22]: **Artemis Research** (research.artemis.ai, incl. "Machine Economy 2030", 2026-03-30, and the 2026-01-30 weekly noting the revamped flagging methodology found 86% of Solana payment activity inorganic). Fetched 2026-07-17; note its Substack figures are raw/loosely-adjusted and differ from the Visa-report adjusted series.

[^23]: **Companion catalog**: "x402 tracking resources — verified due-diligence catalog" (this project, 2026-07-17) — 21 resources, each fetched live with caching disabled; includes the x402-foundation/x402 and awesome-x402 registries, note.com/x402inc analysis stream, Allium schemas, and the eight open measurement niches.

[^24]: **BlockRun public stats endpoint** (blockrun.ai/api/stats) — free one-call JSON: totalTx 18.29M lifetime, 146K tx/24h, $244K volume at verification 2026-07-17 (same-day updatedAt); reconcilable on-chain against its settlement wallet on Basescan.

— Gökhan Turhan × Claude (Opus 4.8 / Fable 5) · [Atelier Gökhan Turhan](https://gokhan.vc) · [Numetal Labs](https://numetal.xyz)
