# Discovery

Agents should probe these before inventing flows:

```text
GET https://api.curb.numetal.xyz/.well-known/x402
GET https://api.curb.numetal.xyz/openapi.json
POST https://api.curb.numetal.xyz/v1/pay   # bare → 402 sample (Base, single accept)
GET https://api.curb.numetal.xyz/llms.txt
GET https://api.curb.numetal.xyz/skill.md
```

`.well-known/x402` is Ishtar-shaped (`x402Version` + `resources[].accepts`) advertising USDC on x402 on **Base** (`eip155:8453`) — a single `gross` accept whose `payTo` is the on-chain 0xSplits split. OpenAPI is the canonical x402scan contract (`x-payment-info` on `POST /v1/pay`; free reads use `security: []`). `llms.txt` / `skill.md` are prose entrypoints.
