# Post an offer

```http
POST https://api.curb.numetal.xyz/v1/offers
Content-Type: application/json
```

```json
{
  "sellerPayTo": "0x…",
  "endpoint": "https://…/v1/chat/completions",
  "model": "llama-3.3-70b",
  "mtok": 10,
  "priceUsd": 0.8,
  "attestation": "optional",
  "note": "optional"
}
```

Required: `sellerPayTo`, `endpoint`, `model`, `mtok`, `priceUsd`.

Returns **201** with the offer object (`id`, status, timestamps).

List open offers: `GET /v1/offers`.
