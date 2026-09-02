# Tillpad MCP

**Bounded storage and search for agent jobs.**

[![Remote MCP](https://img.shields.io/badge/MCP-remote-555?style=flat-square)](https://tillpad.cnrcode.com/mcp)
[![Transport](https://img.shields.io/badge/transport-streamable--http-0ea5e9?style=flat-square)](https://modelcontextprotocol.io)
[![Auth](https://img.shields.io/badge/auth-Bearer%20tp__-111?style=flat-square)](https://tillpad.cnrcode.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](./LICENSE)

Tillpad gives agents namespaced key-value storage, file upload + semantic search, receive-only email inboxes, budget-aware metering, and run keys that wipe with a signed receipt when the job is done.

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

#### Install via Cursor Marketplace (plugin)

This repo includes a [Cursor plugin manifest](.cursor-plugin/plugin.json) and root [`mcp.json`](mcp.json) for one-click install from the [Cursor Marketplace](https://cursor.com/marketplace/publish).

Tillpad MCP tools cover namespaced KVP, RAG search, **receive-only email inboxes** (temporary/permanent addresses, webhooks, blocklist, raw MIME read), budget metering, and run-key wipe receipts.

1. Install the **Tillpad** plugin from the marketplace (or test locally — see below).
2. Open **Cursor Settings → Customize → Tillpad** and set **Tillpad API key** (`tp_…` from bootstrap + machine-pay or the dashboard).
3. Reload the window. MCP tools should appear under the Tillpad server.

The plugin points at `https://tillpad.cnrcode.com/mcp` with `Authorization: Bearer ${TILLPAD_API_KEY}`. Never commit a real key.

**Local plugin test** (before marketplace submission):

```powershell
# Copy catalog repo into Cursor local plugins folder
$dest = "$env:USERPROFILE\.cursor\plugins\local\tillpad"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item -Recurse -Force "C:\dev\tillpad\tillpad-mcp\*" $dest
# Then: Cursor Customize → Tillpad → set TILLPAD_API_KEY → Developer: Reload Window
```

Submit the public repo at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish) when ready.

#### Manual MCP config

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
| `billing_portal` | Stripe Customer Portal URL for subscription management and invoices |
| `billing_purchases_list` | Local payment history; optional `includeStripe` for backfill |
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
| `inbox_create` | Create a receive-only email inbox (temporary or permanent) |
| `inbox_list` | List active receive-only inboxes |
| `inbox_get` | Get one inbox by id |
| `inbox_delete` | Delete an inbox and purge stored messages |
| `inbox_messages_list` | List message metadata for an inbox |
| `inbox_message_get` | Get message metadata and attachment list |
| `inbox_message_raw` | Download raw MIME (meters 1 kvp_op) |
| `inbox_attachment_get` | Download an attachment as base64 (meters 1 kvp_op) |
| `inbox_webhook_create` | Register HTTPS webhook for `email.received` (metadata only) |
| `inbox_webhook_list` | List registered email webhooks |
| `inbox_webhook_delete` | Disable an email webhook |
| `inbox_webhook_deliveries_list` | Webhook delivery log; use `status=failed` for failures |
| `inbox_audit_list` | Inbox audit log for the account |
| `inbox_blocklist_list` | List blocked sender addresses and domains |
| `inbox_blocklist_add` | Block a sender address or entire domain |
| `inbox_blocklist_delete` | Remove a blocklist entry |

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

### Glama

This repo includes a **stdio catalog stub** (`src/main.ts`) so [Glama](https://glama.ai/mcp/servers) can build a container, start the process, and introspect the **35** tool definitions. It does not implement storage or billing — clients still connect to the hosted endpoint above.

Listing: [glama.ai/mcp/servers/number1101/tillpad-mcp](https://glama.ai/mcp/servers/number1101/tillpad-mcp)

After claiming via [`glama.json`](glama.json), configure the Dockerfile admin page:

| Field | Value |
|-------|-------|
| Build steps | `["npm ci", "npm run build"]` |
| CMD arguments | `["node", "dist/main.js"]` |
| Env schema | default (empty — no credentials needed) |
| Placeholder params | `{}` |

Glama generates its own Dockerfile from that form; the repo [`Dockerfile`](Dockerfile) is for local smoke tests only.

Score badge (for awesome-mcp-servers and similar lists):

```markdown
[![number1101/tillpad-mcp MCP server](https://glama.ai/mcp/servers/number1101/tillpad-mcp/badges/score.svg)](https://glama.ai/mcp/servers/number1101/tillpad-mcp)
```

Local verify:

```bash
npm ci && npm run build && npm start   # hangs on stdio — expected
docker build -t tillpad-mcp-stub . && docker run -i tillpad-mcp-stub
```

Full step-by-step (claim, admin Dockerfile, release, awesome-mcp PR): [docs/glama-release.md](docs/glama-release.md).

## License

[MIT](./LICENSE) — catalog, documentation, and schema stub only.
