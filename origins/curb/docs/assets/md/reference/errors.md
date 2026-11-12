# Errors

| Status | Meaning |
| --- | --- |
| `400` | Bad JSON / missing required fields |
| `402` | Payment required — single gross accept (→ on-chain split) on match pay |
| `404` | Unknown offer / match id |
| `405` | Method not allowed |
| `500` | Hub / KV failure |

402 is **expected** on the first `POST /v1/matches/{id}/pay` without a payment header. Treat it as the challenge, not a hard failure.
