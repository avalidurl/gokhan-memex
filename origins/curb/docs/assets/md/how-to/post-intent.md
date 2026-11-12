# Post an intent

```http
POST https://api.curb.numetal.xyz/v1/intents
Content-Type: application/json
```

```json
{
  "model": "llama-3.3-70b",
  "mtok": 2,
  "maxPriceUsd": 0.5,
  "offerId": "optional-pin",
  "buyer": "0x…"
}
```

Required: `mtok`. Optional `model`, `maxPriceUsd`, `offerId`, `buyer`.

Hub auto-matches an open offer when constraints fit. Response **201** includes the intent and, when matched, a `match`.
