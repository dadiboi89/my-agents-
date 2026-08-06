#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = (process.env.N8N_BASE_URL || "").replace(/\/+$/, "");
const API_KEY = process.env.N8N_API_KEY;

if (!BASE_URL) {
  console.error(
    "Missing N8N_BASE_URL environment variable (e.g. https://n8n.example.com). Set it before starting this server."
  );
  process.exit(1);
}
if (!API_KEY) {
  console.error(
    "Missing N8N_API_KEY environment variable. Create one in n8n under Settings > n8n API."
  );
  process.exit(1);
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      "X-N8N-API-KEY": API_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    throw new Error(`n8n API error (${res.status}): ${JSON.stringify(body ?? text)}`);
  }

  return body;
}

function toolResult(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

function toolError(err) {
  return {
    content: [{ type: "text", text: `Error: ${err.message}` }],
    isError: true,
  };
}

const server = new McpServer({
  name: "n8n-mcp",
  version: "1.0.0",
});

server.tool(
  "list_workflows",
  "List workflows on the n8n instance (id, name, active state).",
  {
    active: z.boolean().optional().describe("Filter by active state"),
    limit: z.number().int().min(1).max(250).optional().describe("Max results, default 100"),
  },
  async ({ active, limit }) => {
    try {
      const params = new URLSearchParams();
      if (active !== undefined) params.set("active", String(active));
      if (limit) params.set("limit", String(limit));
      const qs = params.toString() ? `?${params.toString()}` : "";
      const data = await apiFetch(`/workflows${qs}`);
      const slim = (data.data || []).map((w) => ({
        id: w.id,
        name: w.name,
        active: w.active,
        updatedAt: w.updatedAt,
      }));
      return toolResult({ workflows: slim, nextCursor: data.nextCursor ?? null });
    } catch (err) {
      return toolError(err);
    }
  }
);

server.tool(
  "get_workflow",
  "Get a workflow's full definition (nodes, connections, trigger webhook paths) by ID.",
  {
    workflow_id: z.string().describe("The n8n workflow ID"),
  },
  async ({ workflow_id }) => {
    try {
      const data = await apiFetch(`/workflows/${workflow_id}`);
      return toolResult(data);
    } catch (err) {
      return toolError(err);
    }
  }
);

server.tool(
  "set_workflow_active",
  "Activate or deactivate a workflow. Webhook-triggered workflows must be active to accept production webhook calls.",
  {
    workflow_id: z.string().describe("The n8n workflow ID"),
    active: z.boolean().describe("true to activate, false to deactivate"),
  },
  async ({ workflow_id, active }) => {
    try {
      const data = await apiFetch(
        `/workflows/${workflow_id}/${active ? "activate" : "deactivate"}`,
        { method: "POST" }
      );
      return toolResult({ id: data.id, name: data.name, active: data.active });
    } catch (err) {
      return toolError(err);
    }
  }
);

server.tool(
  "trigger_webhook",
  "Trigger a webhook-triggered n8n workflow by its webhook path (e.g. 'limoncino-render-publish'). Fires POST {base}/webhook/{path}. Use test=true to hit the /webhook-test/ endpoint while a workflow is open in 'Listen for test event' mode in the editor.",
  {
    path: z.string().describe("The webhook path configured in the workflow's Webhook trigger node"),
    body: z.record(z.string(), z.any()).optional().describe("Optional JSON body to send to the workflow"),
    test: z.boolean().optional().describe("Hit the test endpoint instead of production (default false)"),
  },
  async ({ path, body, test }) => {
    try {
      const endpoint = `${BASE_URL}/${test ? "webhook-test" : "webhook"}/${path.replace(/^\/+/, "")}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const text = await res.text();
      let parsed;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = text;
      }
      if (!res.ok) {
        throw new Error(`Webhook error (${res.status}): ${JSON.stringify(parsed ?? text)}`);
      }
      return toolResult({ triggered: endpoint, response: parsed });
    } catch (err) {
      return toolError(err);
    }
  }
);

server.tool(
  "list_executions",
  "List recent workflow executions, optionally filtered by workflow ID and status.",
  {
    workflow_id: z.string().optional().describe("Filter by workflow ID"),
    status: z.enum(["error", "success", "waiting"]).optional().describe("Filter by status"),
    limit: z.number().int().min(1).max(250).optional().describe("Max results, default 20"),
  },
  async ({ workflow_id, status, limit }) => {
    try {
      const params = new URLSearchParams();
      if (workflow_id) params.set("workflowId", workflow_id);
      if (status) params.set("status", status);
      params.set("limit", String(limit ?? 20));
      const data = await apiFetch(`/executions?${params.toString()}`);
      const slim = (data.data || []).map((e) => ({
        id: e.id,
        workflowId: e.workflowId,
        status: e.status,
        startedAt: e.startedAt,
        stoppedAt: e.stoppedAt,
      }));
      return toolResult({ executions: slim, nextCursor: data.nextCursor ?? null });
    } catch (err) {
      return toolError(err);
    }
  }
);

server.tool(
  "get_execution",
  "Get one execution's status and (optionally) its full node-by-node data — use for debugging failed runs.",
  {
    execution_id: z.string().describe("The execution ID"),
    include_data: z.boolean().optional().describe("Include full run data (large). Default false."),
  },
  async ({ execution_id, include_data }) => {
    try {
      const qs = include_data ? "?includeData=true" : "";
      const data = await apiFetch(`/executions/${execution_id}${qs}`);
      return toolResult(data);
    } catch (err) {
      return toolError(err);
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
