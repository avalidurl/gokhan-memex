# MCP tools

Endpoint: `POST https://api.curb.numetal.xyz/mcp`

| Tool | Purpose |
| --- | --- |
| `swap_list_offers` | List open sell offers (`limit?`) |
| `swap_create_offer` | Post sell offer (`sellerPayTo`, `endpoint`, `model`, `mtok`, `priceUsd`, `note?`) |
| `swap_create_intent` | Post buy intent (`mtok`, `model?`, `maxPriceUsd?`, `offerId?`, `buyer?`) |
| `swap_get_match` | Fetch match by `matchId` |
| `swap_pay_challenge` | Single-payee x402 challenge for `matchId` (gross → on-chain split) |

JSON-RPC: standard MCP `tools/list` / `tools/call`.
