# Single-payee x402 + on-chain split

A match payment is **one** transfer. The 402 challenge lists a **single** accept:

* **Gross** — the full price in USDC to the **split address** (a [0xSplits](https://splits.org) PushSplit v2 on Base).

This is spec-compliant single-payee x402: the buyer signs **one** payment. The seller cut and the protocol fee are settled **on-chain**, not as separate payment legs.

## Rail

* **USDC on Base** (`eip155:8453`) via x402.

Buyers (or their wallets / facilitators / clients) satisfy the one challenge; the hub marks the match paid and issues a grant.

## How the split works

1. Buyer pays **gross** USDC once to the split address (`payTo`).
2. The gross accumulates in the 0xSplits split contract.
3. A keeper calls the split's `distribute()` — an immutable, on-chain fan-out to the recipients: seller (e.g. 95%) + hub protocol fee (e.g. 5%).

Why single-payee: standard x402 clients sign one payment; the split is enforced **on-chain** by an immutable contract, so the hub never custodies the seller's cut and never proxies token streams. The `extra.breakdown` on the accept is display-only — the on-chain allocation is authoritative.

See also: [Fees](/explanation/fees), [Pay a match](/how-to/pay-match).
