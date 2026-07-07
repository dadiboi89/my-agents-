#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "https://api.creatomate.com/v1";
const API_KEY = process.env.CREATOMATE_API_KEY;

if (!API_KEY) {
  console.error(
    "Missing CREATOMATE_API_KEY environment variable. Set it before starting this server."
  );
  process.exit(1);
}

async function creatomateFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(
      `Creatomate API error (${res.status}): ${JSON.stringify(body ?? text)}`
    );
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
  name: "creatomate-mcp",
  version: "1.0.0",
});

server.tool(
  "list_templates",
  "List Creatomate templates available in your project.",
  {
    page: z.number().int().min(1).optional().describe("Page number, defaults to 1"),
    limit: z.number().int().min(1).max(100).optional().describe("Results per page, max 100"),
  },
  async ({ page, limit }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.set("page", String(page));
      if (limit) params.set("limit", String(limit));
      const qs = params.toString() ? `?${params.toString()}` : "";
      const data = await creatomateFetch(`/templates${qs}`);
      return toolResult(data);
    } catch (err) {
      return toolError(err);
    }
  }
);

server.tool(
  "get_template",
  "Get details for a single Creatomate template by ID.",
  {
    template_id: z.string().describe("The Creatomate template ID"),
  },
  async ({ template_id }) => {
    try {
      const data = await creatomateFetch(`/templates/${template_id}`);
      return toolResult(data);
    } catch (err) {
      return toolError(err);
    }
  }
);

server.tool(
  "render",
  "Create a new render (video or image) from a Creatomate template or raw source JSON, with optional modifications (text/image/video placeholder overrides).",
  {
    template_id: z
      .string()
      .optional()
      .describe("Template ID to render. Provide this OR source, not both."),
    source: z
      .record(z.string(), z.any())
      .optional()
      .describe("Raw Creatomate source JSON describing the composition. Provide this OR template_id."),
    modifications: z
      .record(z.string(), z.any())
      .optional()
      .describe("Key/value overrides for template placeholders, e.g. {\"Text-1.text\": \"Hello\"}"),
    output_format: z
      .enum(["mp4", "mov", "gif", "webm", "png", "jpg"])
      .optional()
      .describe("Desired output format"),
    frame_rate: z.number().optional().describe("Frame rate for video output"),
    width: z.number().int().optional(),
    height: z.number().int().optional(),
  },
  async ({ template_id, source, modifications, output_format, frame_rate, width, height }) => {
    try {
      if (!template_id && !source) {
        throw new Error("Provide either template_id or source.");
      }
      const body = {
        ...(template_id ? { template_id } : { source }),
        ...(modifications ? { modifications } : {}),
        ...(output_format ? { output_format } : {}),
        ...(frame_rate ? { frame_rate } : {}),
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
      };
      const data = await creatomateFetch("/renders", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return toolResult(data);
    } catch (err) {
      return toolError(err);
    }
  }
);

server.tool(
  "get_render",
  "Check the status and result (output URL) of a render by ID.",
  {
    render_id: z.string().describe("The Creatomate render ID"),
  },
  async ({ render_id }) => {
    try {
      const data = await creatomateFetch(`/renders/${render_id}`);
      return toolResult(data);
    } catch (err) {
      return toolError(err);
    }
  }
);

server.tool(
  "list_renders",
  "List recent renders in your project, optionally filtered by status.",
  {
    status: z
      .enum(["planned", "waiting", "transcribing", "rendering", "succeeded", "failed"])
      .optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
  },
  async ({ status, page, limit }) => {
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (page) params.set("page", String(page));
      if (limit) params.set("limit", String(limit));
      const qs = params.toString() ? `?${params.toString()}` : "";
      const data = await creatomateFetch(`/renders${qs}`);
      return toolResult(data);
    } catch (err) {
      return toolError(err);
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
