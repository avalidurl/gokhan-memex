# Pay a match

```http
POST https://api.curb.numetal.xyz/v1/matches/{id}/pay
```

Settlement is single-payee x402 USDC on Base (`eip155:8453`). The buyer pays gross once to an on-chain 0xSplits split; seller + protocol fee are split on-chain.

### Without payment header → 402

The 402 carries a **single** `accepts[]` entry:

* **Gross** — the full price in USDC to the split address (`payTo` = the 0xSplits split on Base).

Sign **one** payment for the gross amount to that `payTo`. Retry with `PAYMENT-SIGNATURE` / `X-Payment`.

### With payment header → 200

On success the match is marked paid and a grant is issued for the seller endpoint. The seller cut and hub fee are then fanned out on-chain via the split's `distribute()`.

### Buyer clients

Any x402 client works — e.g. `agentcash fetch --method POST <matchPayUrl>` or a `pay` / facilitator flow. The buyer signs one EIP-3009 authorization for the gross to the split `payTo`.

Inspect anytime:

```http
GET https://api.curb.numetal.xyz/v1/matches/{id}
```
