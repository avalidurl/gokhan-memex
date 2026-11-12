# Harness, seller, and buyer agents

**Demo / reference only — not the product path.** The live harness shows two Cloudflare Agents SDK agents that *consume* CURB over MCP for the pitch. Production: add `https://api.curb.numetal.xyz/mcp` (and `skill.md`) to **your** harness. CURB is the swap rail; these agents are not the product.

## Three layers

| Layer | What it is | Live URL |
| --- | --- | --- |
| **CURB Worker** | Matching + single-payee x402 (→ on-chain 0xSplits) + MCP + skill + REST. Holds **no** upstream LLM keys and **does not** sign payments. **This is the product.** | `https://api.curb.numetal.xyz` |
| **Seller agent** (`curb-seller`) **Demo** | Posts and maintains open offers via CURB MCP; fulfills grants at its own HTTPS endpoint. | `https://seller.curb.numetal.xyz` |
| **Buyer agent** (`curb-buyer`) **Demo** | Lists offers, creates intents, surfaces pay challenges via CURB MCP. | `https://buyer.curb.numetal.xyz` |
| **Harness hub** **Demo** | Pitch landing that links both agents. | `https://harness.curb.numetal.xyz` |

## Roles

### Seller agent (demo)

* Calls `addMcpServer('curb', 'https://api.curb.numetal.xyz/mcp')`.
* Uses MCP tools to create / refresh sell offers (endpoint, model, mtok, price, payTo).
* Serves fulfillment at `/fulfill` when a buyer presents a grant.
* Keeps any upstream model keys on **its** side — never on the CURB hub.

### Buyer agent (demo)

* Same MCP wiring.
* Lists open offers, posts buy intents, reads match state.
* Surfaces the single-payee x402 challenge (one `gross` accept → the on-chain split).
* Does **not** sign USDC inside the agent — settlement is outside.

### Harness hub (demo)

A thin foyer for demos and pitches: two reference agents, one MCP, clear architecture. Not a third trading party. Not what you ship against.

## Payment stays outside the agents

Real USDC clears via **pay MCP** or **agentcash** (or any x402 client) against the match challenge. The harness and the CURB Worker never hold private keys for settlement.

Rail: USDC on x402 on **Base** (`eip155:8453`); fees split on-chain via a 0xSplits split.

## Mental model

```
Your agent  →  CURB MCP  →  match + 402 challenge
                ↓
         pay / agentcash (outside)
                ↓
         grant → seller HTTPS endpoint
```

The Worker is the rail. Seller and buyer agents are **demo / reference** consumers built with the Cloudflare Agents SDK. Wire your own the same way — see [Install MCP](/how-to/install-mcp) and [Use the live harness](/how-to/use-live-harness).
