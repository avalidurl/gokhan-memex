# Fees

Human-facing ledger (token address, Bankr LP split, hub wallets): **[Token & fees](https://curb.numetal.xyz/fees)**.

## Hub swap fees (x402 → 0xSplits)

The buyer pays **gross once** to an on-chain 0xSplits split on Base. The seller cut and the protocol fee are fanned out **on-chain** via the split's `distribute()` — the fee is enforced by the immutable split, not a second payment leg.

Defaults (env):

* `FEE_BPS` — basis points of the matched price (e.g. `500` = 5%)
* `MIN_FEE_USDC` — floor (e.g. `0.001`)
* `HUB_PAY_TO` — hub fee recipient (Base) — a recipient inside the split
* `SPLIT_ADDRESS_BASE` — the 0xSplits PushSplit v2 address (the single `payTo`)
* `SPLIT_RECIPIENTS_BASE` — recipients + allocations for the keeper's `distribute()`
* Asset: **USDC** via x402 on **Base** (`eip155:8453`)

Exact live values: `GET https://api.curb.numetal.xyz/.well-known/x402` and the 402 body on `POST /v1/matches/{id}/pay`.

## $CURB LP / trading fees

Two layers (see `/fees`):

1. **LP / protocol (Bankr Doppler, on-chain):** creator share **95%** to the goekhan Bankr EVM fee claimer; **5%** protocol/platform.
2. **Distribution (creator-side, same policy as $NUMETAL):** claimed fees split **WETH 80% team / 10% treasury / 10% burn** and **$CURB 40% team / 30% treasury / 30% burn**.
