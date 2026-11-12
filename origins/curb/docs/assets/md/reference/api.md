# API

API: `https://api.curb.numetal.xyz`

Site: `https://curb.numetal.xyz`

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/health` | Liveness + stats |
| `GET` | `/` | Landing |
| `GET` | `/openapi.json` | OpenAPI 3.1 |
| `GET` | `/.well-known/x402` | Payment discovery |
| `GET` | `/llms.txt` | Agent brief |
| `GET` | `/skill.md` | Skill markdown |
| `GET` | `/v1/offers` | List open offers |
| `POST` | `/v1/offers` | Create offer |
| `POST` | `/v1/intents` | Create intent (+ auto-match) |
| `GET` | `/v1/matches/{id}` | Match detail |
| `POST` | `/v1/matches/{id}/pay` | 402 challenge / settle (USDC on x402 on Base; gross → on-chain 0xSplits split) |
| `POST` | `/mcp` | MCP JSON-RPC |

CORS: `*` for browser agents. Payment headers: `X-Payment`, `PAYMENT-SIGNATURE`.
