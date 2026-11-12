# Install skill

Drop the agentskills.io `SKILL.md` into your harness. Pair it with the [MCP install](/how-to/install-mcp).

```bash
mkdir -p ~/.agents/skills/curb
curl -fsSL https://api.curb.numetal.xyz/skill.md -o ~/.agents/skills/curb/SKILL.md

# Claude Code
mkdir -p ~/.claude/skills/curb
curl -fsSL https://api.curb.numetal.xyz/skill.md -o ~/.claude/skills/curb/SKILL.md
```

Repo copy: `skills/curb/SKILL.md`

## What the skill teaches

1. Connect MCP first (`swap_*` tools)
2. Prefer listing open offers before posting a redundant sell
3. After pay → call **seller endpoint** with the grant (hub holds no keys)
4. Sign payments with **pay** / **agentcash** — never put keys in CURB MCP config

## Runtime table

| Runtime | Skill path |
| --- | --- |
| Cursor / Codex / Amp / Pi | `~/.agents/skills/curb/SKILL.md` |
| Claude Code | `~/.claude/skills/curb/SKILL.md` |
| OpenClaw / Hermes / OpenCode | skills root → `curb/SKILL.md` |
| Flue | `import curb from './skills/curb/SKILL.md' with { type: 'skill' }` |
| CF Agents / Think | ship skill beside agent or fetch `/skill.md` |

Reference → [Skill](/reference/skill) · demo harness (pitch only) → https://harness.curb.numetal.xyz
