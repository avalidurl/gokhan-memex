# Sell capacity

List inference capacity so buyers can match and pay you on-chain.

## Preconditions

* A reachable OpenAI-compatible (or similar) chat endpoint you control
* A Base USDC `sellerPayTo` address
* Model id + million-token (`mtok`) slice + `priceUsd`

## 1. Post the offer

```bash
curl -s -X POST https://api.curb.numetal.xyz/v1/offers \
  -H 'content-type: application/json' \
  -d '{
    "sellerPayTo": "0xYourSeller",
    "endpoint": "https://your-inference.example/v1/chat/completions",
    "model": "llama-3.3-70b",
    "mtok": 10,
    "priceUsd": 0.8,
    "note": "warm pool"
  }' | jq .
```

## 2. Wait for match

Buyers post intents; the hub auto-matches when constraints fit. Poll:

```bash
curl -s https://api.curb.numetal.xyz/v1/matches/MATCH_ID | jq .
```

## 3. Buyer pays you + hub

Settlement is single-payee x402: the buyer pays gross once to an on-chain 0xSplits split on Base, which fans out your seller USDC and the hub protocol fee on-chain. After pay, the buyer holds a grant to hit **your** endpoint — the hub never proxies tokens through your LLM key.

## Next

* Offer fields → [Post an offer](/how-to/post-offer)
* Why keys stay off-hub → [Why no keys](/explanation/why-no-keys)
