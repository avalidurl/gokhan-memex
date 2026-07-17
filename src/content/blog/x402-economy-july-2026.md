---
title: "The x402 economy — July 2026"
description: "Rev.2, dual-lens verified: a measurement-first mapping of the x402 machine-payments economy — $847.8K/30d across 17.67M transactions, one vendor at 21% of volume and 82% of count. Lens-tagged for LLMs and agents, with errata and a canonical JSON appendix. Joint research by Gökhan Turhan and several Claude models."
publishDate: "2026-07-17"
author: "Gökhan Turhan"
category: "technology"
tags: ["x402", "agentic-payments", "agentic-commerce", "stablecoins", "forecasting", "base", "solana", "machine-economy", "agi"]
featured: true
draft: false
excerpt: "Mapping an emergent economy at the axes of AGI and self-refactoring, cryptographically secured payment rails. Rev.2, every number re-verified against primary sources. Joint research, Gökhan Turhan × Claude."
originalUrl: "https://gokhan.vc/blog/x402-economy-july-2026"
ogImage: "https://gokhan.vc/og-x402-economy-2026-07.png"
---

*First published — canonically — on [gokhan.vc →](https://gokhan.vc/blog/x402-economy-july-2026)*

> **This report is a joint research output by Gökhan Turhan and several Claude models, including Opus 4.8 and Fable 5.** Nothing here is investment advice. It is an attempt at mapping an emergent economy at the axes of artificial general intelligence and self-refactoring, cryptographically secured payment rails — with or without blockchains in the traditional sense.

## 0. How to read this document (instructions for agents)

This report is written to be consumed by LLMs and autonomous agents as much as by humans. Conventions:

- **Every quantitative claim is tagged** `[lens · window · retrieved]`. A claim without its lens is a bug; report it.
- **Four measurement lenses**, deliberately not merged, because they disagree and the disagreement is signal:
  - `LENS.ONCHAIN` — our Dune queries over facilitator-attributed token transfers (Base query 8001312, Solana 8009658, size-buckets 8001313). Known coverage: ~10% of LENS.SCAN volume, due to facilitator address churn.
  - `LENS.SCAN` — x402scan.com, the ecosystem's own indexer (registered/discovered sellers only).
  - `LENS.NPM` — npmjs download counts (developer-funnel proxy; CI noise applies).
  - `LENS.EXT` — third-party anchors (Chainalysis, CoinDesk), widest surface, least reproducible.
- **§A is the canonical machine-readable appendix.** If prose and appendix ever conflict, the appendix wins.
- **Reproduction**: collectors run daily 06:10 UTC; forecast vintages freeze weekly (Mon 07:00 UTC); the surprise index scores realized values against the prior frozen vintage. The pipeline costs €6.49/month to operate.
- Figures are monochrome engineering sheets; each carries its lens in the footer.

## 1. Executive summary

1. **Size is lens-dependent, and no lens agrees.** The measured 30-day economy is **$847.80K across 17.67M transactions, 48.24K buyers, 61K sellers** `[LENS.SCAN · past 30d · live 2026-07-17 14:42 UTC, dual-lens verified]`, implying a **$0.048 mean ticket**. The same month reads **~75M transactions / ~$24M** at `[LENS.EXT · 30d · CoinDesk 2026-07-15]`. The 4.2× count gap and ~28× volume gap between the ecosystem's own indexer and external analytics is finding #1: the denominator of this economy is not yet agreed upon, even by its participants.
2. **One vendor is one-fifth of the economy.** BlockRun (AI model routing with built-in payment) earned **$177.26K in 30 days = 20.9% of all measured volume — and 14.48M of the 17.67M transactions, i.e. 82% of ALL measured x402 transactions, from ~1.13K buyers** — 9.5× vendor #2 `[LENS.SCAN · live 2026-07-17]`. The first proven killer app of machine-native payments is *machines paying for intelligence itself*.
3. **Counts fall, value holds — a quality-improving contraction.** Realized 14-day transfers came in at **0.61× forecast (Base) and 0.62× (Solana)** while USD volume ran **1.12× and 1.06×** `[LENS.ONCHAIN + forecast vintage frozen 2026-07-02]`. Sub-cent ping/wash traffic is decaying faster than trend; paid usage is not.
4. **Facilitator churn breaks static measurement within weeks.** Community facilitator catalogs (basis of every public Dune dashboard, ours included) now capture **10.5%** of LENS.SCAN volume; FluxA, Meridian, Primer, Mogami and rotated Coinbase addresses carry the unindexed rest `[cross-lens · 2026-07-17]`.
5. **Developer funnel: stable core, contracting edges.** `x402` npm holds ~1.21M downloads/month (+6% WoW); client helpers contract sharply (`x402-fetch` −42%, `@coinbase/x402` −39% WoW) `[LENS.NPM · 2026-07-17]` — integration is consolidating into hosted gateways.
6. **Thesis instrument status** ("x402 success is not yet priced in"): the surprise index reads **negative on counts, mildly positive on value**. The confirmation pattern — counts and value surprising positive together, plus vendor de-concentration — **has not fired**. Run-rate of the measured economy: **~$10.17M/year** `[LENS.SCAN annualized]`.

## 2. Measurement infrastructure

Pipeline (operational since 2026-07-16): three collectors (Dune per-facilitator dailies; x402scan structured snapshots; npm counts) → scrub layer (ping-storm flag: >95% sub-cent transfers ∧ <5 unique buyers per day×facilitator) → parquet in object storage → weekly statsforecast vintages (SeasonalNaive / AutoARIMA / AutoETS / Theta; rolling-origin CV; winner per series; 28-day quantile forecasts) → surprise index.

Marginal cost of the entire apparatus: **€6.49/month** (one small VPS) + ~22 Dune credits/day inside the free tier + one Firecrawl scrape/day. Zero paid model APIs.

Declared limits: `LENS.ONCHAIN` catalogs are stale (§5, fix queued); `LENS.SCAN` indexes only registered sellers and displays mixed windows (30d on the home page; a site-labeled "Past 24 Hours" window on /facilitators and /networks — confirmed live, and highly volatile day to day); `LENS.EXT` relays x402.org's self-reported stats via CoinDesk.

## 3. Macro state

| Metric, past 30d | LENS.SCAN | LENS.EXT (CoinDesk, relaying x402.org self-reported stats) |
|---|---|---|
| Transactions | 17.67M | ~75M |
| USD volume | $847.80K | ~$24M |
| Buyers | 48.24K | ~94K |
| Sellers | 61K | ~22K |
| Mean ticket | $0.048 | ~$0.32 |

Both lenses agree on shape — tens of millions of machine-initiated payments, tens of thousands of counterparties per side, sub-dollar tickets — and disagree on magnitude by ~4–28×. Cause, now verified in the primary article: the CoinDesk figures are x402.org's own self-reported homepage stats (CoinDesk states this explicitly) — the widest counting surface; LENS.SCAN counts only transfers attributed to indexed x402 resources.

Historical arc `[LENS.ONCHAIN · Base slice · Aug 2025 → Jul 2026]`: peak day **2025-11-15 at 3,785,401 transfers** in our catalog slice alone (the $PING farming era, a ~300× count inflation). The slice has since collapsed −80.6% MoM in transfers (324,981 → 62,905) — a compound of wash decay (real) and catalog decay (measurement artifact, §5).

**Payment-size structure** `[LENS.ONCHAIN · TWZRD scrubbed Solana sample, cumulative · n=1,506,245 payments, $409,308]`:

| Bucket | Count share | Value share |
|---|---|---|
| < $0.01 | 28.50% | 0.17% |
| $0.01–0.10 | 50.02% | 6.86% |
| $0.10–1 | 13.52% | 20.52% |
| $1–10 | 7.85% | **53.61%** |
| $10+ | 0.11% | 18.84% |

**78.5% of payments sit below $0.10 and carry 7.0% of value; the $1–10 bucket is the economic center of gravity.** Independently, Chainalysis reports the $1+ volume share rose 49% → 95% from early 2025 to early 2026 `[LENS.EXT]`. All lenses converge here: micro-pings are noise; small-but-real payments are the economy.

![FIG. 02 — payment size distribution](https://gokhan.vc/x402-report/fig-02-payment-size-distribution.svg)

## 4. Networks: Base vs Solana

The two lenses invert each other; both inversions are informative.

| | Base | Solana |
|---|---|---|
| `[LENS.SCAN · past 24h · live 2026-07-17]` tx | 206,609 (97.6% of tx) | 5,043 (2.4%) |
| `[LENS.SCAN · past 24h · live 2026-07-17]` volume | $19.26K (97.1% of vol) | $572 (2.9%) |
| `[LENS.ONCHAIN · 30d ending 2026-07-16]` tx | 62,905 | **433,872** (+381% MoM) |
| `[LENS.ONCHAIN · 30d ending 2026-07-16]` volume | $10.89K | **$78.28K** (+55% MoM) |

(The site labels the facilitators/networks window "Past 24 Hours", and it swings violently: a ~2026-07-15 sample of the same page showed Base 224,221 tx / $33.14K vs Solana 35,840 / $2.99K — Solana's daily scan-lens share collapsed from 13.8% to 2.4% of transactions in two days. Single-day tables from this page are weather, not climate.)

Reconciliation: our Solana catalog happens to contain PayAI's *live* settlement signer; our Base catalog is missing the currently dominant facilitator addresses. Joint reading: **Base carries most indexed volume; Solana's growth claim rests on the 30-day on-chain lens** (+381% MoM in our PayAI-signer slice), while its daily scan-lens share is small and volatile — both facts, held together. Ticket texture: Solana slice medians run $0.001–0.01/day (smallest payments live there); Base carries larger tickets (Anyspend median ≈ $1.00) `[LENS.ONCHAIN]`.

## 5. Facilitators — the settlement layer

`[LENS.SCAN · site-labeled "Past 24 Hours" · live 2026-07-17 14:42 UTC, dual-lens · window total: 211,652 tx / $19.83K]`

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

(The ~2026-07-15 sample additionally showed Dexter at 25,131 tx / $1.04K on Solana, Heurist 917, Cascade 355 — all three absent from the live 2026-07-17 window. A facilitator roster that churns within days is itself the finding.)

![FIG. 04 — facilitators, transactions vs volume](https://gokhan.vc/x402-report/fig-04-facilitators.svg)

Findings:

- **Coinbase CDP is the default clearing house**: 92.9% of window transactions and the widest seller base (3,823 in the live window). The x402 economy currently has one dominant rail — and its dominance strengthened between our two samples (80.2% → 92.9%).
- **Meridian is the structural outlier**: $3.56K on 191 transactions in the live window = **$18.64 mean ticket, ~390× the ecosystem mean** of $0.048 (the 07-15 sample showed $26.45 / 568×). Real invoices, not micro-pings, are settling through x402. High-ticket facilitation is emerging as a distinct niche.
- **FluxA (Base, now #2 by transactions) and Dexter (Solana, already gone from the live window again) are fast entrants** absent from all community catalogs. Facilitator addresses churn in weeks — the roster itself churns in days. Consequence, quantified: `LENS.ONCHAIN` captures **10.5%** of `LENS.SCAN` volume. Catalog regeneration from x402scan attribution is the single highest-value pipeline fix (queued).
- Within our stable-address slice `[LENS.ONCHAIN · Base · 30d]`, leaders were Anyspend ($5.4K), PayAI ($4.1K), Thirdweb ($905).

## 6. Vendors — who earns

`[LENS.SCAN · 30d revenue · retrieved 2026-07-17]`

| Vendor | 30d revenue | Sells |
|---|---|---|
| **BlockRun** | **$177.26K** | AI model routing, payment built in — **14.48M transactions in 30 days (82% of the entire measured economy's count) from ~1.13K buyers** |
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

- **Extreme concentration.** Top vendor = 20.9% of measured volume and **82% of measured transaction count**; #1 out-earns #2 by 9.5×; the BlockRun family (incl. Solana surface) ≈ $179K. The median registered seller earns ≈ nothing. Power-law, pre-consolidation.
- **Two demand shapes.** Industrial deep-usage (BlockRun: 14.48M tx from ~1.13K buyers — a small fleet of agents hammering one rail) vs breadth plays (Otto 559 buyers, StableEnrich 554) vs micro-niches (dTelecom: $18.75K from just 24 buyers).
- **x402 is a billing layer over the existing API economy**, not a parallel service universe: top vendors resell Exa/Firecrawl/OpenAI-compatible inference behind a BYO-wallet meter.

## 7. Sectors — what the money buys

Classification of the top-20 marketplace servers + the 61-project ecosystem registry `[LENS.SCAN · 2026-07-17]`:

| Sector | Representative vendors | Revenue evidence |
|---|---|---|
| AI inference & routing | BlockRun, JarvisClaw, claw402, 2s, Daydreams Router | **Dominant: ~$179K/30d** |
| Speech / media generation | dTelecom, StableStudio | #2: $17K+ |
| Trading & on-chain intel | Otto, Nansen, SniperX, Deepnets, Questflow, SolEnrich | Most crowded by vendor count; small revenue each |
| Data enrichment & search | StableEnrich, Exa, Firecrawl endpoints | Mid-tail: ~$2K |
| Social data | twit.sh, StableSocial | Small, real: $600+ |
| Chain data / RPC | OneSource, x402node, Net, BaseHub | Utility tickets |
| Payments / agent infra | Syra, Polymer Prove, MCPay, Latinum, Loyal Spark | Monetizes indirectly |

Registry composition (42–44 projects rendered live 2026-07-17; a ~07-15 cached extraction showed 61 — the page lazy-loads and categories overlap, so treat composition as approximate): Infrastructure & Tooling 14, Services/Endpoints 16, Client-Side 7, Facilitators 5, Learning 4 — **roughly a third of the registered ecosystem is picks-and-shovels** serving an end-demand that is one routing vendor deep.

Sectoral law observed so far: **agents pay first for compute (inference), then for perception (data, search, social), then for action (trading, telecom) — in that revenue order.** Everything monetizing well is an input to running more agents.

## 8. Developer funnel

`[LENS.NPM · verified against api.npmjs.org · 2026-07-17]`

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

**Backtest** `[rolling-origin CV, h=14 · rMAE vs SeasonalNaive, <1 beats baseline]`:

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

**Surprise index** `[realized Jul 3–16 ÷ forecast frozen Jul 2 · LENS.ONCHAIN]`:

| Series | Realized/forecast | z |
|---|---|---|
| Base transfers | **0.61×** | −0.0¹ |
| Base volume | **1.12×** | +0.0¹ |
| Solana transfers | **0.62×** | −1.0 (last day −1.86) |
| Solana volume | **1.06×** | +0.05 |

¹ z ≈ 0 despite large ratio miss because 80% intervals on the Base series are extremely wide (fig. 01); the ratio is the informative statistic there.

![FIG. 05 — surprise index](https://gokhan.vc/x402-report/fig-05-surprise-index.svg)

Interpretation: **quantity undershoots, value overshoots** — wash evaporating faster than the model expected, paid usage slightly ahead of it. Automated weekly vintages begin 2026-07-20.

## 10. Assessment and watchlist

**Frame.** Measured run-rate: **$10.17M/year** `[LENS.SCAN annualized]` against narrative-scale expectations (Visa/Mastercard/Ripple joined the standard 2026-07-15 `[LENS.EXT]`). The narrative-to-GDP gap is enormous, and cuts both ways. Current evidence: a working mechanism; one proven killer app (paying for inference); one dominant clearing rail; genuinely improving payment quality; extreme vendor concentration; **no inflection in the data yet**.

**Confirmation pattern for the thesis** — the pipeline now watches these automatically:

1. Count *and* value surprise positive together for ≥2 consecutive weekly vintages.
2. BlockRun share < ~15% while total volume rises (demand broadening beyond inference).
3. Ecosystem median ticket climbing through $1 while counts recover (Meridian-style flows becoming a sector).
4. npm client-lib contraction reversing, or gateway *buyer* counts (not request counts) compounding.
5. Continued facilitator entry (FluxA/Dexter-class) without Coinbase-share collapse — rail competition without rail fragility.

**Queued pipeline upgrades:** facilitator catalogs regenerated from x402scan attribution (highest-value fix); daily seller-level concentration series; Chronos-2/Moirai-2 vs the §9 bar; payer funding-cluster wash analysis; Bass/logistic adoption fits for scenario bounds.

## Errata & verification — revision v2 (2026-07-17)

After first publication, every external number in this report was re-verified against primary sources: x402scan was re-scraped with Firecrawl's cache disabled AND independently rendered in a real browser via Browserbase (CDP session, 14:42 UTC — the two lenses agreed exactly, and both matched our own pipeline's 06:10 UTC snapshot); the CoinDesk and Chainalysis articles were crawled and quoted directly; npm was re-pulled (15/15 figures exact). Corrections applied in this revision:

- **Provenance**: the original LENS.SCAN capture was unknowingly served from a Firecrawl cache of ~2026-07-15 while labeled "retrieved 2026-07-17". All LENS.SCAN values above are now live dual-lens readings from 2026-07-17 14:42 UTC. (Pipeline fixed: cache disabled + a stat-label pairing bug corrected.)
- **Headline 30d**: $870.24K / 18.68M tx / 52.4K buyers / 55K sellers → **$847.80K / 17.67M / 48.24K / 61K**.
- **Facilitators/networks**: the window is site-labeled "Past 24 Hours" and swings violently — Solana's daily share fell 13.8% → 2.4% between samples; Dexter, Heurist and Cascade left the window; Coinbase's share rose 80.2% → 92.9%; Meridian's day sample halved (ticket-size finding unchanged).
- **Attribution**: the 75M / $24M / 94K / 22K figures are CoinDesk relaying **x402.org's self-reported homepage stats** (verified verbatim in the article) — not Chainalysis. The Chainalysis claims used here (100M milestone, $1+ share 49%→95%, 10¢–$1 collapse 46%→4%) were verified verbatim against the primary post. A "$0.00025 Solana fee" figure appeared in neither source and has been removed.
- **Registry**: 61 → 42–44 rendered live, with overlapping categories; treated as approximate.
- **New doubly-confirmed stat**: BlockRun alone processed **14.48M of 17.67M transactions — 82% of the measured economy's count — from ~1.13K buyers**.
- **Unchanged**: all npm figures (15/15 exact), all LENS.ONCHAIN series, the backtest, and the surprise index. Every story-level thesis survives; several strengthen.

The newsletter dispatched before this revision carried the v1 headline numbers; the deltas are rolling-window drift and change no conclusion.

---

## A. Canonical data appendix (machine-readable)

Authoritative over prose. Units: USD unless noted; windows as stated.

```json
{
  "asof": "2026-07-17T14:42:00Z (rev.2, live dual-lens)",
  "verification": {
    "method": "Firecrawl maxAge=0 + Browserbase real-browser CDP session (30dc699d), 2026-07-17 14:42 UTC; lens agreement: exact",
    "primary_articles": {
      "coindesk_2026_07_15": "4/4 figures verified verbatim; numbers are x402.org self-reported homepage stats",
      "chainalysis_2026_06_03": "$1+ share 49%\u219295%, 10c-$1 46%\u21924%, 100M milestone verified verbatim"
    },
    "npm": "15/15 figures exact",
    "v1_provenance_error": "original LENS.SCAN capture was a ~2026-07-15 Firecrawl cached serve mislabeled as 2026-07-17"
  },
  "lenses": {
    "scan_30d": {
      "volume_usd": 847800,
      "tx": 17670000,
      "buyers": 48240,
      "sellers": 61000,
      "mean_ticket_usd": 0.048
    },
    "ext_30d": {
      "source": "CoinDesk 2026-07-15, relaying x402.org self-reported homepage stats",
      "tx": 75000000,
      "volume_usd": 24000000,
      "buyers": 94000,
      "sellers": 22000
    },
    "onchain_30d": {
      "window_end": "2026-07-16",
      "base": {
        "tx": 62905,
        "volume_usd": 10892,
        "tx_prev30": 324981,
        "volume_prev30": 50940
      },
      "solana": {
        "tx": 433872,
        "volume_usd": 78279,
        "tx_prev30": 90140,
        "volume_prev30": 50465
      },
      "coverage_vs_scan": 0.105,
      "base_peak_day": {
        "date": "2025-11-15",
        "tx": 3785401
      }
    }
  },
  "size_buckets_solana_twzrd": {
    "n_payments": 1506245,
    "volume_usd": 409308,
    "buckets": [
      {
        "range": "<0.01",
        "count_share": 0.285,
        "value_share": 0.0017
      },
      {
        "range": "0.01-0.10",
        "count_share": 0.5002,
        "value_share": 0.0686
      },
      {
        "range": "0.10-1",
        "count_share": 0.1352,
        "value_share": 0.2052
      },
      {
        "range": "1-10",
        "count_share": 0.0785,
        "value_share": 0.5361
      },
      {
        "range": "10+",
        "count_share": 0.0011,
        "value_share": 0.1884
      }
    ]
  },
  "facilitators_past_24h_live": {
    "window_total": {
      "tx": 211652,
      "volume_usd": 19830
    },
    "rows": [
      [
        "Coinbase",
        196720,
        12670
      ],
      [
        "FluxA",
        13020,
        3020
      ],
      [
        "PayAI",
        3616,
        515.85
      ],
      [
        "Primer",
        202,
        52.74
      ],
      [
        "Meridian",
        191,
        3560
      ],
      [
        "Polymer",
        187,
        18.7
      ],
      [
        "AnySpend",
        139,
        233
      ],
      [
        "Mogami",
        105,
        0.52
      ]
    ],
    "meridian_mean_ticket": 18.64,
    "meridian_vs_eco_mean": 390,
    "coinbase_tx_share": 0.929,
    "sample_2026_07_15": {
      "window_total": {
        "tx": 260097,
        "volume_usd": 36020
      },
      "coinbase_tx_share": 0.802,
      "departed_since": [
        "Dexter",
        "Heurist",
        "Cascade"
      ]
    }
  },
  "networks_past_24h_live": {
    "base_tx": 206609,
    "base_vol_usd": 19260,
    "solana_tx": 5043,
    "solana_vol_usd": 572,
    "base_tx_share": 0.976,
    "sample_2026_07_15": {
      "base_tx": 224221,
      "solana_tx": 35840,
      "solana_tx_share": 0.138
    }
  },
  "vendors_30d": [
    [
      "BlockRun",
      177260
    ],
    [
      "dTelecom",
      18750
    ],
    [
      "StableEnrich",
      1770
    ],
    [
      "sol.blockrun.ai",
      1270
    ],
    [
      "twit.sh",
      621
    ],
    [
      "agentutility",
      589
    ],
    [
      "JarvisClaw",
      560
    ],
    [
      "Nansen AI",
      131
    ],
    [
      "Otto AI",
      105
    ],
    [
      "OneSource",
      73
    ]
  ],
  "vendor_concentration": {
    "top1_volume_share": 0.209,
    "top1_tx_share": 0.82,
    "top1_tx": 14480000,
    "top1_buyers": 1130,
    "top1_vs_top2": 9.5
  },
  "npm_wow": {
    "x402": 1.06,
    "x402-axios": 1.14,
    "x402-express": 0.97,
    "@coinbase/x402": 0.61,
    "x402-fetch": 0.58,
    "x402_month_total": 1205461
  },
  "backtest_rmae_vs_snaive": {
    "base_transfers": 0.4573,
    "base_transfers_scrubbed": 0.4376,
    "base_volume_usd": 1.0,
    "solana_transfers": 0.5618,
    "solana_transfers_scrubbed": 0.5635,
    "solana_volume_usd": 0.6674
  },
  "surprise_14d": {
    "base_transfers": 0.607,
    "base_volume": 1.118,
    "solana_transfers": 0.618,
    "solana_volume": 1.063,
    "solana_transfers_mean_z": -1.0
  },
  "ecosystem_registry": {
    "rendered_live": "42-44",
    "cached_0715_extraction": 61,
    "note": "page lazy-loads; categories overlap",
    "infrastructure_tooling": 14,
    "services_endpoints": 16,
    "client_side": 7,
    "facilitators": 5,
    "learning": 4
  },
  "run_rate_usd_yr": 10170000,
  "infra_cost_eur_month": 6.49,
  "dune_queries": {
    "base_daily": 8001312,
    "solana_daily_windowed": 8009658,
    "size_buckets": 8001313
  }
}
```

**Provenance (rev.2):** LENS.SCAN verified live 2026-07-17 14:42 UTC by two independent methods — Firecrawl with cache disabled AND a Browserbase real-browser session — in exact agreement (home = "Past 30 Days"; facilitators/networks = site-labeled "Past 24 Hours"). LENS.ONCHAIN from our owned Dune queries, windows ending 2026-07-16; catalogs forked 2026-07-16 from community queries 6158127/6165774, known stale. LENS.NPM verified live twice, exact. LENS.EXT: primary articles crawled and quoted — CoinDesk 2026-07-15 (figures are x402.org self-reported homepage stats), Chainalysis 2026-06-03 "Agentic Payments Cross the Threshold".

## Coda — from our shop

Disclosure: we don't just measure these rails, we operate on them. Two Numetal systems live on x402 today, and both are raising:

- **[Ishtar](https://ishtar.numetal.xyz)** — agents court on your behalf. An agent-mediated courtship venue: x402-priced surfaces, HeartPrefs dating-docs, the HeartBench model leaderboard. $20k round, $4k a head — not a pre-seed. Raise deck: [ishtar.numetal.xyz/deck/not-raising-a-preseed](https://ishtar.numetal.xyz/deck/not-raising-a-preseed/) · [PDF](https://assets.numetal.xyz/deck/ishtar-deck-not-a-preseed.pdf)
- **[CURB](https://curb.numetal.xyz)** — agents swap excess inference; CURB clears it on-chain. USDC over x402 on Base, fees split via 0xSplits; the money loop was proven on Base on 2026-07-09. Raise deck: [curb.numetal.xyz/deck](https://curb.numetal.xyz/deck) · [PDF](https://curb.numetal.xyz/deck.pdf)

— Gökhan Turhan × Claude (Opus 4.8 / Fable 5) · [Atelier Gökhan Turhan](https://gokhan.vc) · [Numetal Labs](https://numetal.xyz)
