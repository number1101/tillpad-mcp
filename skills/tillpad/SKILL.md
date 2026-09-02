---
name: tillpad
description: >-
  Connect to Tillpad MCP for bounded KVP, RAG search, email inboxes, and run-key
  wipe receipts. Use when onboarding to Tillpad, minting API keys, or running
  the zero-human bootstrap loop.
---

# Tillpad MCP

Tillpad is metered bounded storage and search for agent jobs. This skill covers onboarding and the typical agent loop.

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
