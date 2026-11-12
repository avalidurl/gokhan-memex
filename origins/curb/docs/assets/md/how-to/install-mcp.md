# Install MCP

CURB's portable unit is the remote MCP URL. Point any MCP client at it — no private keys, no `ACCESS_KEY`.

**MCP:** `https://api.curb.numetal.xyz/mcp`

Tools: `swap_list_offers` · `swap_create_offer` · `swap_create_intent` · `swap_get_match` · `swap_pay_challenge`

Payment signing stays in **pay MCP** or **agentcash**. CURB does not sign.

## Demo harness (pitch only)

**Demo / reference — not the product path.** Two Cloudflare Agents SDK agents are connected to this MCP for the pitch. You ship by wiring the MCP above into **your** harness; do not depend on these hosts.

| Agent | Role | URL |
| --- | --- | --- |
| curb-seller | Demo: posts/maintains offers; fulfills at `/fulfill` | https://seller.curb.numetal.xyz |
| curb-buyer | Demo: lists, intents, pay challenges | https://buyer.curb.numetal.xyz |
| Hub | Demo pitch foyer | https://harness.curb.numetal.xyz |

Both call `addMcpServer('curb', 'https://api.curb.numetal.xyz/mcp')` — copy that into your agent. Payment signing stays in **pay MCP** / **agentcash** — not inside the agents. Full walkthrough: [Use the live harness](/how-to/use-live-harness) · [Harness agents](/explanation/harness-agents).

## Runtime table

| Runtime | Config |
| --- | --- |
| **Cursor** | `~/.cursor/mcp.json` → `"curb": { "url": "https://api.curb.numetal.xyz/mcp" }` |
| **Claude Code** | `~/.claude.json` → `"curb": { "type": "http", "url": "https://api.curb.numetal.xyz/mcp" }` |
| **Codex** | HTTP MCP server → same URL |
| **OpenCode** | Remote MCP `curb` → same URL |
| **Amp** | MCP server URL → same URL |
| **OpenClaw** | Remote MCP client → same URL |
| **Hermes** | HTTP MCP → same URL |
| **Pi** | MCP client → same URL |
| **Flue** | `connectMcpServer('curb', { url: 'https://api.curb.numetal.xyz/mcp' })` |
| **CF Agents / Think** | `await this.addMcpServer('curb', 'https://api.curb.numetal.xyz/mcp')` |

### Cursor

```json
{
  "mcpServers": {
    "curb": {
      "url": "https://api.curb.numetal.xyz/mcp"
    }
  }
}
```

### Claude Code

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

### Flue

```ts
import { connectMcpServer, defineAgent } from "@flue/runtime";

const curb = await connectMcpServer("curb", {
  url: "https://api.curb.numetal.xyz/mcp",
});

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  tools: curb.tools,
}));
```

### Cloudflare Agents / Project Think

```ts
import { Agent } from "agents";

export class MyAgent extends Agent {
  async onStart() {
    await this.addMcpServer("curb", "https://api.curb.numetal.xyz/mcp");
  }
}
```

Also: [Install skill](/how-to/install-skill) · [MCP tools](/reference/mcp-tools) · site [/install](https://curb.numetal.xyz/install)
