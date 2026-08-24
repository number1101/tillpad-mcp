# Tillpad MCP

**Bounded storage and search for agent jobs.**

[![Remote MCP](https://img.shields.io/badge/MCP-remote-555?style=flat-square)](https://tillpad.cnrcode.com/mcp)
[![Transport](https://img.shields.io/badge/transport-streamable--http-0ea5e9?style=flat-square)](https://modelcontextprotocol.io)
[![Auth](https://img.shields.io/badge/auth-Bearer%20tp__-111?style=flat-square)](https://tillpad.cnrcode.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](./LICENSE)

Tillpad gives agents namespaced key-value storage, file upload + semantic search, budget-aware metering, and run keys that wipe with a signed receipt when the job is done.

**Live endpoint:** [`https://tillpad.cnrcode.com/mcp`](https://tillpad.cnrcode.com/mcp)

> This repository is the **public catalog and schema stub** for directory crawlers. It is not the hosted server. Point MCP clients at the live URL above with a Tillpad API key. Running the TypeScript in this repo does not store or search anything.

**Agent guide:** see [AGENTS.md](./AGENTS.md) for discovery URLs, auth, and MCP connect snippets.

## Get an API key

### Zero-human (agents)

1. `POST https://tillpad.cnrcode.com/api/agents/bootstrap` with `{ "email": "agent@example.com" }` → `bootstrapToken` (no outbound mail).
2. `POST https://tillpad.cnrcode.com/api/billing/machine-pay` with `Authorization: Bearer <bootstrapToken>` and optional `{ "sku": "pro_prepaid_30d" }`.
3. Settle Stripe MPP ($9.00 / 30 days) → response includes `secret` (`tp_…`) and `planPeriodEnd`.

See [scratchpad.txt](https://tillpad.cnrcode.com/scratchpad.txt) and [llms-full.txt](https://tillpad.cnrcode.com/llms-full.txt). Legal: [Terms](https://tillpad.cnrcode.com/terms).

### Human path

1. Open [tillpad.cnrcode.com](https://tillpad.cnrcode.com) and create an account.
2. Subscribe to Tillpad Pro on [Pricing](https://tillpad.cnrcode.com/pricing), then mint an API key in the dashboard. Secrets start with `tp_`.
3. Use an **account** key for ongoing access, or a **run** key when the job should expire and wipe.

Never commit a real key. Use the `tp_…` placeholder in configs.

## Connect a client

Transport is **Streamable HTTP**. Send `Authorization: Bearer tp_…` on every request.

### Cursor

User or project MCP config:

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

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "tillpad": {
      "command": "npx",
      "args": ["mcp-remote", "https://tillpad.cnrcode.com/mcp", "--header", "Authorization: Bearer tp_…"]
    }
  }
}
```

### Generic remote MCP

```json
{
  "url": "https://tillpad.cnrcode.com/mcp",
  "headers": {
    "Authorization": "Bearer tp_…"
  }
}
```

Discovery manifests on the product host:

- [/.well-known/mcp.json](https://tillpad.cnrcode.com/.well-known/mcp.json)
- [/.well-known/mcp/server.json](https://tillpad.cnrcode.com/.well-known/mcp/server.json)
- [/llms.txt](https://tillpad.cnrcode.com/llms.txt)

## Tools

Schemas in [`src/server.ts`](src/server.ts) match the hosted server.

| Tool | What it does |
|------|----------------|
| `usage_get` | Current period usage and quotas |
| `budget_get` | Remaining quotas, soft thresholds, and a checkout URL |
| `budget_estimate` | Preflight 402/429 before spending (`textLength` / `byteLength` for `rag_index`) |
| `billing_machine_pay` | How agents unlock prepaid Pro or buy SKUs via Stripe MPP (`sku` optional) |
| `agent_bootstrap` | Zero-human onboarding: bootstrap token from email (no outbound mail) |
| `keys_create` | Mint a run/sub key from an account `tp_` key |
| `kvp_put` | Store a string under a namespace/key (response includes `budget`) |
| `kvp_get` | Read a namespaced value |
| `kvp_delete` | Delete a KVP key |
| `kvp_list` | List keys in a namespace |
| `file_upload` | Upload UTF-8 text for RAG indexing (prefLights `rag_index`) |
| `files_list` | List uploaded files |
| `files_types` | Supported upload extensions and MIME types |
| `rag_search` | Semantic search over indexed documents |
| `inspect_storage` | Namespace inventory (scoped to the key when applicable) |
| `run_finish` | Wipe namespaces bound to this **run** key; returns a signed wipe receipt |
| `support_contact` | Contact Tillpad support from a **Pro** account; replies go to the account email |

## Typical agent loop

1. Mint a **run** key in the dashboard (dedicated namespace, TTL, optional op budget).
2. Store working state with `kvp_put` and/or `file_upload`.
3. Retrieve with `kvp_get` / `kvp_list` and `rag_search`.
4. Call `run_finish` to wipe run namespaces and keep the signed receipt.

Use `budget_estimate` before large index jobs. `budget_get` / `usage_get` show what is left in the period.

## Auth and errors

- **401** — missing or invalid `Authorization: Bearer tp_…`
- **402 / 429** — plan or quota. JSON includes `code`, `status`, `actions`, and `budget`
  - `actions[].type: "checkout"` — hosted Stripe Checkout URL for a **recurring** human subscription
  - `actions[].type: "machine_pay"` — agent prepaid Pro (30/90 days) or top-up SKUs via Stripe MPP; default sku `pro_prepaid_30d` at $9.00

This is Stripe Machine Payments Protocol, not ChatGPT Instant Checkout / ACP.

## Product docs

- App: [tillpad.cnrcode.com](https://tillpad.cnrcode.com)
- Docs: [tillpad.cnrcode.com/docs](https://tillpad.cnrcode.com/docs)
- Scratchpad: [tillpad.cnrcode.com/docs/scratchpad](https://tillpad.cnrcode.com/docs/scratchpad)
- OpenAPI: [tillpad.cnrcode.com/openapi.json](https://tillpad.cnrcode.com/openapi.json)

The Tillpad product (Worker, billing, storage) is closed source. This catalog is MIT-licensed so directories can list tools and install snippets.

## Directory listing

Registry name: **`com.cnrcode/tillpad`** (domain namespace via [cnrcode.com](https://cnrcode.com/.well-known/mcp-registry-auth)).

1. Ensure `https://cnrcode.com/.well-known/mcp-registry-auth` is deployed (`cnrcode-site` repo).
2. Set GitHub repo secret **`MCP_PRIVATE_KEY`** (hex; see `cnrcode-site` key generation script).
3. Push a version tag so [GitHub Actions](.github/workflows/publish-mcp.yml) publishes `server.json` to the [official MCP Registry](https://registry.modelcontextprotocol.io):

   ```bash
   git tag v0.1.1
   git push origin v0.1.1
   ```

4. Optionally submit [https://github.com/number1101/tillpad-mcp](https://github.com/number1101/tillpad-mcp) at [mcp.directory/submit](https://mcp.directory/submit).

## License

[MIT](./LICENSE) — catalog, documentation, and schema stub only.
