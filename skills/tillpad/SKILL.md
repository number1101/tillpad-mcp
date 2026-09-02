---
name: tillpad
description: >-
  Connect to Tillpad MCP for bounded KVP, RAG search, receive-only email inboxes
  (webhooks, blocklist, raw MIME), and run-key wipe receipts. Use when onboarding
  to Tillpad, minting API keys, creating agent inboxes, or running the zero-human
  bootstrap loop.
---

# Tillpad MCP

Tillpad is metered bounded storage and search for agent jobs: namespaced KVP, file upload + RAG search, receive-only email inboxes, budget-aware metering, and run keys that wipe with a signed receipt.

**Live endpoint:** https://tillpad.cnrcode.com/mcp

## Zero-human bootstrap

1. `POST https://tillpad.cnrcode.com/api/agents/bootstrap` with `{ "email": "agent@example.com" }` → `bootstrapToken`
2. `POST https://tillpad.cnrcode.com/api/billing/machine-pay` with `Authorization: Bearer <bootstrapToken>` and `{ "sku": "pro_prepaid_30d" }`
3. Settle Stripe MPP ($9.00 / 30 days) → response includes `secret` (`tp_…`) and `planPeriodEnd`

Or use MCP tools `agent_bootstrap` and `billing_machine_pay`.

## Typical agent loop

1. Mint a **run** key with `keys_create` (or dashboard) — dedicated namespace, TTL, optional op budget
2. Store working state with `kvp_put` and/or `file_upload`
3. Retrieve with `kvp_get` / `kvp_list` and `rag_search`
4. Call `run_finish` to wipe run namespaces and keep the signed receipt

Use `budget_estimate` before large index jobs. `budget_get` / `usage_get` show remaining quota.

## Receive-only email inboxes

Agents can provision **inbound-only** addresses on Tillpad's configured domain (`GET /api/config` → `inboundEmailDomain`, default `centralmail.us`). No outbound send — receive, store, and read only.

**Create an inbox** with `inbox_create`:

- `kind`: `temporary` (TTL expires and purges) or `permanent`
- `localPart`: the address prefix before `@domain`

**Read mail** via `inbox_messages_list`, `inbox_message_get`, `inbox_message_raw` (raw MIME, meters 1 kvp_op), and `inbox_attachment_get` (base64, meters 1 kvp_op).

**Webhooks:** register with `inbox_webhook_create` for HMAC-signed `email.received` notifications (metadata only — no body in the webhook payload). Monitor failures with `inbox_webhook_deliveries_list` (`status=failed` after retries).

**Blocklist:** `inbox_blocklist_add` / `inbox_blocklist_delete` to block sender addresses or entire domains account-wide.

**Audit:** `inbox_audit_list` for who created inboxes and received messages.

Inbound email is metered (`inbound_email` quota). See llms-full.txt for REST equivalents under `/api/inboxes`.

## Discovery

| Resource | URL |
|----------|-----|
| LLM site map | https://tillpad.cnrcode.com/llms.txt |
| Full agent guide | https://tillpad.cnrcode.com/llms-full.txt |
| Scratchpad quickstart | https://tillpad.cnrcode.com/scratchpad.txt |
| MCP discovery | https://tillpad.cnrcode.com/.well-known/mcp.json |

## Billing errors

402/429 responses include `code`, `actions` (checkout or machine_pay), and `budget`. Follow the offered actions — do not invent a billing flow.

Legal: https://tillpad.cnrcode.com/terms
