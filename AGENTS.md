# AGENTS.md

Guidance for AI agents and coding assistants working with Tillpad.

## What Tillpad is

Tillpad is metered bounded storage and search for agent jobs: namespaced KVP, file upload + RAG search, budget-aware metering, run keys that wipe with a signed receipt, REST + MCP.

**Live product:** https://tillpad.cnrcode.com

This repository (`tillpad-mcp`) is the **public MCP catalog stub** for directory crawlers. It is not the hosted server.

## Start here

1. Read the curated site index: https://tillpad.cnrcode.com/llms.txt
2. Run the scratchpad loop: https://tillpad.cnrcode.com/scratchpad.txt (~5 min)
3. Full agent guide: https://tillpad.cnrcode.com/llms-full.txt

## Connect MCP

Point any MCP client at the live endpoint with a Tillpad API key (`tp_…`):

```json
{
  "mcpServers": {
    "tillpad": {
      "url": "https://tillpad.cnrcode.com/mcp",
      "headers": {
        "Authorization": "Bearer tp_…"
      }
    }
  }
}
```

Mint keys at https://tillpad.cnrcode.com after subscribing to Pro.

## Machine-readable discovery

| Resource | URL |
|----------|-----|
| LLM site map | https://tillpad.cnrcode.com/llms.txt |
| Full agent guide | https://tillpad.cnrcode.com/llms-full.txt |
| Scratchpad quickstart | https://tillpad.cnrcode.com/scratchpad.txt |
| OpenAPI 3.1 | https://tillpad.cnrcode.com/openapi.json |
| Interactive API | https://tillpad.cnrcode.com/swagger |
| MCP discovery | https://tillpad.cnrcode.com/.well-known/mcp.json |
| MCP server descriptor | https://tillpad.cnrcode.com/.well-known/mcp/server.json |
| Agent capability card | https://tillpad.cnrcode.com/.well-known/agent-card.json |
| Sitemap | https://tillpad.cnrcode.com/sitemap.xml |

## Authentication

- **Agents:** `Authorization: Bearer tp_…` (account, run, or scoped sub key)
- **Humans:** email OTP → session JWT (Turnstile on OTP only; API/MCP paths are CAPTCHA-free)

Active Pro subscription is required to create keys and run metered work.

## Tool schemas

Input schemas for all 15 MCP tools are in:

- https://tillpad.cnrcode.com/.well-known/mcp.json (under `mcpServers.tillpad.tools`)
- [`src/server.ts`](src/server.ts) in this repo (Zod stubs matching production)

## Billing errors

402/429 responses include machine-readable JSON: `code`, `actions` (checkout or machine_pay), and `budget`. Do not invent a billing flow — follow the offered actions.

## This repo vs the product

| | Product (private) | This repo (public) |
|---|---|---|
| Role | Live Worker, REST, SPA, MCP | Catalog + schema stub for MCP Registry |
| MCP URL | https://tillpad.cnrcode.com/mcp | Points clients to product URL |
| Handlers | Real storage, billing, auth | Stub messages only |

When tool names or schemas change in production, update `src/server.ts` and README here to stay in sync.
