/**
 * Schema stub for directory crawlers.
 *
 * This is not the hosted Tillpad MCP server. Tool names, descriptions, and
 * input shapes match production. Handlers only tell clients to use:
 *   https://tillpad.cnrcode.com/mcp
 *   Authorization: Bearer tp_…
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const HOSTED_MCP = "https://tillpad.cnrcode.com/mcp";

const stubMessage =
  "This repository is a catalog stub. Connect to " +
  HOSTED_MCP +
  " with Authorization: Bearer tp_… (mint a key at https://tillpad.cnrcode.com).";

function stub() {
  return {
    content: [{ type: "text" as const, text: stubMessage }],
  };
}

export const server = new McpServer({
  name: "tillpad",
  version: "0.1.0",
});

server.tool(
  "usage_get",
  "Get current period usage and quotas for the authenticated account",
  {},
  async () => stub(),
);

server.tool(
  "budget_get",
  "Get remaining quotas, soft thresholds, and checkout URL for topping up",
  {},
  async () => stub(),
);

server.tool(
  "budget_estimate",
  "Estimate whether an operation would hit 402/429 before spending. For rag_index you can pass textLength/byteLength instead of amount.",
  {
    kind: z.enum(["kvp_ops", "storage_bytes", "rag_index", "rag_query"]),
    amount: z.number().optional(),
    textLength: z.number().optional(),
    byteLength: z.number().optional(),
  },
  async () => stub(),
);

server.tool(
  "billing_machine_pay",
  "Describe how to unlock Pro or purchase agent SKUs via Stripe MPP. Optional sku (default pro_prepaid_30d). Returns POST URL and amount; agent must call HTTP with MPP Payment credential.",
  {
    sku: z
      .enum([
        "pro_prepaid_30d",
        "pro_prepaid_90d",
        "topup_kvp_10k",
        "topup_storage_1gb",
      ])
      .optional(),
  },
  async () => stub(),
);

server.tool(
  "agent_bootstrap",
  "Start zero-human onboarding: create bootstrap token from email (no outbound mail). Next POST /api/billing/machine-pay with Bearer bootstrapToken.",
  {
    email: z.string(),
    label: z.string().optional(),
  },
  async () => stub(),
);

server.tool(
  "keys_create",
  "Mint a run or sub API key from an account key (REST POST /api/keys). Requires account tp_ key.",
  {
    name: z.string().optional(),
    kind: z.enum(["run", "sub"]),
    ttlSeconds: z.number().optional(),
    namespaces: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    opBudget: z.number().optional(),
    wipeOnExpire: z.boolean().optional(),
  },
  async () => stub(),
);

server.tool(
  "kvp_put",
  "Store a string value under a namespace/key. Response includes budget remaining.",
  {
    namespace: z.string(),
    key: z.string(),
    value: z.string(),
    expirationTtl: z.number().optional(),
  },
  async () => stub(),
);

server.tool(
  "kvp_get",
  "Read a value from namespaced KVP storage",
  { namespace: z.string(), key: z.string() },
  async () => stub(),
);

server.tool(
  "kvp_delete",
  "Delete a KVP key",
  { namespace: z.string(), key: z.string() },
  async () => stub(),
);

server.tool(
  "kvp_list",
  "List keys in a KVP namespace",
  {
    namespace: z.string(),
    limit: z.number().optional(),
    cursor: z.string().optional(),
  },
  async () => stub(),
);

server.tool(
  "file_upload",
  "Upload a UTF-8 text document for RAG indexing into a namespace. PrefLights rag_index capacity.",
  {
    namespace: z.string(),
    filename: z.string(),
    text: z.string(),
    contentType: z.string().optional(),
  },
  async () => stub(),
);

server.tool(
  "files_list",
  "List uploaded files (optionally filter by namespace)",
  { namespace: z.string().optional() },
  async () => stub(),
);

server.tool(
  "files_types",
  "List supported RAG upload file types (extensions, MIME types, extract notes)",
  {},
  async () => stub(),
);

server.tool(
  "rag_search",
  "Semantic search over indexed documents",
  {
    query: z.string(),
    namespace: z.string().optional(),
    topK: z.number().optional(),
  },
  async () => stub(),
);

server.tool(
  "inspect_storage",
  "Summarize namespaces, key counts, file/vector inventory",
  {},
  async () => stub(),
);

server.tool(
  "run_finish",
  "Wipe all namespaces bound to this run key and return a signed wipe receipt. Only valid for run keys.",
  {},
  async () => stub(),
);

server.tool(
  "support_contact",
  "Contact Tillpad support from a Pro account. Delivers your subject and message to the Tillpad team; replies go to the account email. Requires an active Pro subscription.",
  {
    subject: z.string(),
    message: z.string(),
  },
  async () => stub(),
);
