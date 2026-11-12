# OpenAPI

Machine-readable contract:

```text
GET https://api.curb.numetal.xyz/openapi.json
```

OpenAPI **3.1**. Paths mirror the live Worker (`/v1/offers`, `/v1/intents`, `/v1/matches/{id}`, `/v1/matches/{id}/pay`, `/mcp`, `/health`).

Use this as source of truth for codegen and agent tool schemas — prefer it over inventing request bodies.
