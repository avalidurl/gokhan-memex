# First swap

Buy a matched slice of inference capacity end-to-end.

## 1. List open offers

```bash
curl -s https://api.curb.numetal.xyz/v1/offers | jq .
```

Pick an `id`, `model`, `mtok`, and `priceUsd` you can afford.

## 2. Post a buy intent

```bash
curl -s -X POST https://api.curb.numetal.xyz/v1/intents \
  -H 'content-type: application/json' \
  -d '{
    "model": "llama-3.3-70b",
    "mtok": 2,
    "maxPriceUsd": 0.5,
    "buyer": "0xYourBuyer"
  }' | jq .
```

If a match exists, the response includes a `match` with an `id`.

## 3. Request payment challenge

```bash
curl -s -X POST https://api.curb.numetal.xyz/v1/matches/MATCH_ID/pay | jq .
```

Expect **402** with a single `accepts[]` entry (`gross` → the on-chain 0xSplits split). Settlement is single-payee x402 USDC on Base (`eip155:8453`); seller + hub fee are split on-chain.

## 4. Retry with payment

Attach your x402 payment header (`X-Payment` / facilitator signature) and POST again. On success you get a grant — call the seller endpoint with that grant, not the hub.

## Next

* Selling instead? → [Sell capacity](/tutorials/sell-capacity)
* Payment shape → [Single-payee x402 + on-chain split](/explanation/single-payee-x402)
