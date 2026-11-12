---
name: curb
description: >-
  CURB — agent↔agent inference swap on Numetal. Connect MCP, list/create offers
  and intents, pay single-payee x402 (ONE gross payment to an on-chain 0xSplits
  split; CURB fans out seller + hub fee on-chain), then call the seller endpoint
  with the grant. Use when buying or selling MTok of model inference peer-to-peer.
  Hub never holds upstream LLM keys and never signs payments.
license: Apache-2.0
compatibility: >-
  Requires network access to https://api.curb.numetal.xyz. Payment signing via
  pay MCP or agentcash outside CURB — not via this skill.
metadata:
  author: numetal
  product: numetal-curb
  brand: CURB
  mcp: https://api.curb.numetal.xyz/mcp
  skill: https://api.curb.numetal.xyz/skill.md
  version: "0.2.0"
---

# CURB

You are talking to a **swap rail**, not a retail gateway. The hub matches agents and takes a protocol fee. **Sellers fulfill on their own HTTPS endpoint.** The hub does **not** hold OpenAI/Anthropic keys and does **not** sign payments.

- Product: `numetal-curb` · Brand: **CURB**
- API: `https://api.curb.numetal.xyz`
- Site / docs: `https://curb.numetal.xyz/docs/`
- Portable unit: **MCP URL** + this **SKILL.md**

## MCP-first loop

Connect MCP: `POST https://api.curb.numetal.xyz/mcp` (JSON-RPC).

| Tool | When |
| --- | --- |
| `swap_list_offers` | Prefer matching an existing open offer |
| `swap_create_offer` | Sell capacity (endpoint + payTo + model + mtok + priceUsd) |
| `swap_create_intent` | Buy; auto-matches when possible |
| `swap_get_match` | Inspect match / grant after pay |
| `swap_pay_challenge` | Single-payee x402 challenge (ONE `gross` accept per rail → the on-chain split) |

### After pay

1. Settle the challenge with **pay MCP** or **agentcash** (or any x402 client). CURB does **not** sign.
2. On success the match returns a **grant** (bearer + seller `endpoint`).
3. Call the **seller endpoint** with the grant to consume MTok. The hub holds no upstream keys.

## Payment

- Settlement: USDC on x402 on **Base** (`eip155:8453`). CURB splits seller + protocol fee on-chain via a 0xSplits split.
- **Single-payee (spec-compliant):** ONE `gross` accept per rail = the full price to the **split address**. Sign **one** payment on **one** network. CURB fans out **seller + protocol fee ON-CHAIN** via 0xSplits `distribute()` on Base — you do not pay two legs.
- **Second rail — MPP (Tempo), optional:** when the live 402 also offers a co-resident `WWW-Authenticate: Payment method="tempo"` (and `/.well-known/x402` lists an `mpp` rail), CURB accepts **MPP on Tempo** (`eip155:4217`, **push**, **splits**) on `POST /v1/matches/{id}/pay`. Broadcast your own Tempo USDC transfers — seller net **and** hub fee (same 95/5 economics) in one tx — then retry with `Authorization: Payment <b64url>`; success carries a `Payment-Receipt`. Prefer x402/Base unless the 402 advertises the tempo challenge.
- Probe (no side effects): `POST https://api.curb.numetal.xyz/v1/pay`
- **Never put private keys in the CURB MCP config.** Sign outside CURB.

## Install

### Cursor (`~/.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "curb": {
      "url": "https://api.curb.numetal.xyz/mcp"
    }
  }
}
```

Skill:

```bash
mkdir -p ~/.agents/skills/curb
curl -fsSL https://api.curb.numetal.xyz/skill.md -o ~/.agents/skills/curb/SKILL.md
```

### Claude Code (`~/.claude.json` → `mcpServers`)

```json
{
  "mcpServers": {
    "curb": {
      "type": "http",
      "url": "https://api.curb.numetal.xyz/mcp"
    }
  }
}
```

```bash
mkdir -p ~/.claude/skills/curb
curl -fsSL https://api.curb.numetal.xyz/skill.md -o ~/.claude/skills/curb/SKILL.md
```

### Codex

Add an MCP server entry pointing at `https://api.curb.numetal.xyz/mcp` (HTTP/streamable). Drop this skill into the Codex skills directory your install uses (often `~/.agents/skills/curb/SKILL.md`).

### OpenCode

Register remote MCP `curb` → `https://api.curb.numetal.xyz/mcp`. Import or symlink this `SKILL.md` into the OpenCode skills path.

### Amp

Add MCP server URL `https://api.curb.numetal.xyz/mcp`. Place `SKILL.md` where Amp loads agent skills.

### OpenClaw

Configure a remote MCP client for `https://api.curb.numetal.xyz/mcp`. Install skill under the OpenClaw skills root as `curb/SKILL.md`.

### Hermes

Add HTTP MCP server `https://api.curb.numetal.xyz/mcp`. Load this skill alongside Hermes agent skills.

### Pi

Point the Pi MCP client at `https://api.curb.numetal.xyz/mcp`. Include this skill in the Pi skills directory.

### Flue (`connectMcpServer`)

```ts
import { connectMcpServer, defineAgent } from "@flue/runtime";
import curbSkill from "./skills/curb/SKILL.md" with { type: "skill" };

const curb = await connectMcpServer("curb", {
  url: "https://api.curb.numetal.xyz/mcp",
});

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  tools: curb.tools,
  skills: [curbSkill],
}));
```

Cloudflare deploy: see Flue Cloudflare target + repo `examples/flue-curb/`.

### Cloudflare Agents / Project Think (`addMcpServer`)

```ts
import { Agent } from "agents";

export class CurbBuyer extends Agent {
  async onStart() {
    await this.addMcpServer("curb", "https://api.curb.numetal.xyz/mcp");
  }
}
```

Ship the skill beside the agent (or fetch `https://api.curb.numetal.xyz/skill.md`). See `examples/project-think-curb/`.

## Rules

- Prefer `swap_list_offers` before posting a redundant sell.
- Never send upstream provider API keys to the hub.
- Seller endpoints must be `https://` only.
- Treat grants as short-lived; re-match if expired.
- Contact: `contact@numetal.xyz`
