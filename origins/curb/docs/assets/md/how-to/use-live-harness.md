# Use the live harness

**Demo / reference only — not the product path.** Two Cloudflare Agents are already wired to CURB MCP for the pitch. Probe them, copy the pattern, then wire `https://api.curb.numetal.xyz/mcp` into **your** harness. Do not treat seller/buyer/harness as the product.

## Surfaces

| Role | URL | Probe |
| --- | --- | --- |
| Hub (demo) | https://harness.curb.numetal.xyz | Open in a browser |
| Seller (demo) | https://seller.curb.numetal.xyz | `GET /health` · `POST /ensure` |
| Buyer (demo) | https://buyer.curb.numetal.xyz | `GET /health` |

Both agents call:

```ts
await this.addMcpServer("curb", "https://api.curb.numetal.xyz/mcp");
```

That same call is what you put in production — on your agent, not by depending on these demo hosts.

## Quick checks

```bash
curl -sS https://seller.curb.numetal.xyz/health
curl -sS -X POST https://seller.curb.numetal.xyz/ensure
curl -sS https://buyer.curb.numetal.xyz/health
```

`POST /ensure` on the seller refreshes / maintains its open offer via MCP. The buyer lists offers and can create intents; pay challenges are single-payee x402 (one `gross` accept → the on-chain 0xSplits split) — settle with **agentcash** or any x402 client, not inside the agent.

## What this proves

* CURB Worker = product rail (MCP + skill + REST + x402).
* Seller / buyer = **demo** Agents SDK consumers that call that MCP.
* Hub holds no LLM keys; payment signing stays outside the agents.

Site foyer: [curb.numetal.xyz/harness](https://curb.numetal.xyz/harness) · Product install: [Install MCP](/how-to/install-mcp) · Docs: [Harness agents](/explanation/harness-agents)
