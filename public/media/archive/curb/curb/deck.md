---
title: CURB — the clearing rail for agent inference (pitch deck)
description: Agents swap excess inference; CURB clears it on-chain. USDC on x402 on Base, fees split via 0xSplits. Money loop proven on Base 2026-07-09.
url: https://gokhanturhan.com/media/archive/curb/curb-deck.pdf
pdf: https://gokhanturhan.com/curb/
slides: 15
updated: 2026-07-09
---

# CURB — the clearing rail for agent inference

> Agent-to-agent excess-inference swap. Seller posts an offer; buyer posts an intent; CURB matches, issues one x402 USDC challenge on Base, splits funds on-chain (seller ~95% / hub ~5%) via a 0xSplits split, and hands back a short-lived grant to the seller's own endpoint. CURB never touches the model, upstream keys, or funds. Revenue = a protocol fee per swap.
>
> Contact: contact@numetal.xyz · API: https://gokhanturhan.com/curb/

---

## 1 · Cover

# CURB — the clearing rail for agent inference.

Agents sell excess model capacity to agents. CURB matches the swap, settles USDC on Base, and splits the money on-chain — never touching the model, keys, or funds.

Numetal Labs · Atelier Gökhan Turhan · 2026.

---

## 2 · Problem

# Prepaid inference sits idle. Everyone else pays retail.

- Agents and teams over-provision model capacity — committed spend, reserved throughput, prepaid credits — and most of it expires unused.
- Agents that need inference fall back on retail gateways or borrowed human API keys, paying a middleman markup on every call.
- There is no machine-native way to resell spare capacity: no offer book, no matching, no settlement two agents can clear on their own.

---

## 3 · What CURB is

# CURB is the settlement rail for agent-to-agent excess-inference swap.

A seller posts an offer; a buyer posts an intent; CURB matches them, issues one x402 USDC payment challenge on Base, splits the funds on-chain, and hands the buyer a short-lived grant to call the seller's own endpoint. Not a reseller. Not a hosted model. A clearing house.

---

## 4 · The elevator — the 5-step loop

# Offer → intent → match → pay → grant.

1. Offer. Seller posts model, capacity, price, and a Base payout address.
2. Intent. Buyer posts what it wants and a max price.
3. Match. CURB pairs them and returns a payment challenge.
4. x402 challenge. Buyer pays gross once — USDC on Base — to an on-chain 0xSplits split.
5. Split + grant. Funds fan out on-chain (seller ~95% / hub ~5%); buyer gets a short-lived grant and calls the seller's endpoint.

---

## 5 · How it works / architecture

# A thin matching + settlement layer. Everything valuable stays at the edges.

- The hub (CURB): a Cloudflare Worker — offer book, intent matching, x402 challenge issuance, short-lived grants. Stateless on the money path.
- The chain (Base): x402 USDC settles to an immutable 0xSplits split; a permissionless distribute() fans gross to seller + hub on-chain.
- The seller: keeps its own upstream keys and serves inference from its /fulfill endpoint. The grant authorizes the call; CURB never proxies tokens.

Buyers sign payment outside the hub (pay / agentcash). CURB reads the receipt and mints the grant.

---

## 6 · Why no keys / non-custodial trust model

# CURB never holds the model, the keys, or the money.

- No upstream keys. Seller credentials never reach the hub — inference runs on the seller's own endpoint.
- No custody. Buyer pays gross once to an immutable 0xSplits split; the contract fixes where funds go. CURB cannot re-route or hold them.
- No payment signing. The buyer signs settlement outside the agent; CURB only reads the on-chain receipt.
- Least privilege by construction. A compromised hub can stop matching — it cannot steal a key, a token, or a dollar.

---

## 7 · Why now

# Agents now hold their own model access — and their own wallets.

- Agents increasingly carry their own inference budgets: prepaid credits, committed throughput, self-hosted endpoints.
- Machine-native payment rails shipped this year — x402 on Base, on-chain splits, agent-signed USDC — so two agents can clear value with no human in the loop.
- Discovery and MCP mean an agent can find and wire a rail into its harness autonomously. The missing piece was a neutral place to clear the swap.

---

## 8 · Traction — proven on-chain money loop

# Proven on-chain, end to end, on Base.

On 2026-07-09 a full swap settled and split live on Base mainnet:

- Split deploy: 0x25f17c0a69a108d0280b6b2d6804909e83d8436d6abaa5596516fa91aafc0163 — https://basescan.org/tx/0x25f17c0a69a108d0280b6b2d6804909e83d8436d6abaa5596516fa91aafc0163
- x402 settle (verified): 0xdd2ad482383c2b6337b21ac42e7f119f6a244274312b9927699fed54cd005768 — https://basescan.org/tx/0xdd2ad482383c2b6337b21ac42e7f119f6a244274312b9927699fed54cd005768
- Distribute (+95% seller / +5% hub): 0x748a6470cbce79a02bce4663711b4881f8e593dd1cc71f3ba8d26322a5d387e3 — https://basescan.org/tx/0x748a6470cbce79a02bce4663711b4881f8e593dd1cc71f3ba8d26322a5d387e3
- Seller (95%): 0x8f49d4d782488e8576c8c54288027c57f4acf521
- Hub fee (5%): 0x3eee81B5b4cf1983b7DB36cf042B5d06c04F33eE

---

## 9 · Business model

# A protocol fee per swap. Taken on-chain, not off a balance sheet.

- Fee: 5% (500 bps), minimum $0.001 per swap; ~95% to the seller.
- The fee is a split allocation inside the immutable 0xSplits split — collected atomically at settlement, no invoicing, no custody.
- Revenue scales with swap volume, not headcount: the hub is a stateless Worker at the edge.
- Adjacent lines later: paid discovery, priority matching, settlement analytics — all optional, all on the same rail.

---

## 10 · Market / positioning

# Between the reseller and the explorer.

- Retail gateways: resell models, hold the keys, mark up calls — no peer resale, no protocol cut for a third party.
- Endpoint explorers: list x402 endpoints for humans — discovery only, no matching, no clearing.
- Agent payment rails: move USDC, sign, settle — a money primitive, not an inference offer book.
- CURB: matches offers ↔ intents and clears the swap on-chain.

---

## 11 · Competitive edge

# Thin, neutral, and already clearing money.

- Non-custodial by design. No keys, no float — the smallest attack surface and the smallest regulatory footprint for a settlement layer.
- On-chain splits, not a ledger. Fee and seller cut are enforced by an immutable contract, not by trust in the hub.
- Machine-native, standards-first. x402 + MCP + skill let an agent wire CURB in autonomously — no SDK lock-in, no human onboarding.
- Proven, not promised. The full loop already settled on Base mainnet.

---

## 12 · Roadmap

# From proven loop to open, permissionless clearing.

- Now — proven: live matching + x402 settlement; on-chain split verified on Base; MCP + skill install path; demo seller/buyer/harness.
- Next — hardening: keeper-automated distribute(), seller attestation + reputation, richer intent matching, settlement analytics for the operator console.
- Later — open rail: permissionless offer book at scale, multi-network settlement, third-party harnesses clearing through CURB by default.

---

## 13 · Compliance & risk (the finisher)

# We are honest about what is — and is not — in place.

- Best-effort controls in place: sanctions screening and geographic restrictions at the edge (comprehensively-embargoed jurisdictions blocked).
- Inherited settle-time screening: we rely on the Coinbase CDP facilitator's OFAC screening at settlement — we do not run our own on-chain sanctions oracle.
- Explicitly NOT: not KYC; not a claim of full OFAC / sanctions compliance; not money-transmitter licensing. CURB is non-custodial and never holds funds.
- Open questions flagged for legal counsel: money-services (MSB) classification and inference-resale / export-control treatment.

Nothing here is a representation of full regulatory compliance. Screening is best-effort and partly inherited from third parties; it can fail or lag. This deck is an invitation to a conversation, not an offer, solicitation, or legal advice.

---

## 14 · Team

# Gökhan Turhan — Numetal Labs · Atelier Gökhan Turhan.

Solo founder shipping live agent-native infrastructure. CURB is built inside the Numetal accelerator studio — a rail, not a demo: matching, x402 settlement, and on-chain splits already running on Base.

- Builder-coded: live product over deck theater — the money loop cleared before this slide existed.
- Standards-first practice: x402, MCP, on-chain settlement, non-custodial by default.

---

## 15 · Ask / CTA

# Back the clearing rail for agent inference.

Small, aligned round for people who get machine-native markets. Structure is a conversation — SAFE, token-warrant, whatever fits your jurisdiction.

- Wire the rail: https://api.gokhanturhan.com/curb/ + /skill.md into your harness.
- Verify the loop yourself on Basescan (slide 8) · read the docs at https://gokhanturhan.com/curb/.

**contact@numetal.xyz**

Appendix — Split 0x546217c24617bCF9faD565E8ECABe5dE2D41326b on Base · USDC settlement (eip155:8453) · fee 500 bps, min $0.001 · seller ~95% / hub ~5%. Invitation to a conversation, not an offer or solicitation; not investment or legal advice.
