# n8n Workflows — Limoncino TV pipeline

Self-hosted automation replacing the Zapier last-mile (and going further: generation batching).
No per-call approval gates — the workflows run on your server, under your credentials.

## The three workflows

| File | Trigger | What it does |
|---|---|---|
| `wf1-render-publish.json` | Manual (click "Execute") | Fetches the episode's Creatomate composition JSON (from this repo's raw URL) → starts the render → polls every 30s until done → downloads the MP4 → uploads to YouTube **private** with made-for-kids + Italian metadata → logs to the "Publishing Log" sheet → Telegram ping with the video link |
| `wf2-weekly-analytics.json` | Every Monday 08:00 | Pulls last-7-days channel stats from the YouTube Analytics API → appends to the "Analytics Log" sheet → sends a Telegram digest |
| `wf3-keyframe-batch.json` | Manual | Reads the "Shots" sheet (the tracker CSV imported to Google Sheets), takes every row with `Keyframe = todo` and a `Prompt`, generates each keyframe via the Kling API (one at a time, polling until done), writes the image URL back into the row, Telegram ping when the batch finishes |
| `wf4-mcp-server-trigger.json` | MCP Server Trigger (always-on) | Exposes WF1/WF2/WF3 as named tools (`render_and_publish_episode`, `get_weekly_analytics`, `generate_keyframe_batch`) that Claude Desktop, claude.ai, or Claude Code can call directly — see §4 Path B |

Division of labor stays the same as planned: **Claude does the creative work** (scripts, prompts, QC judgment, packaging) — **n8n runs the machine** (batches, polling, uploads, logs, notifications).

## 1. Hosting

**Option A — self-host (free, recommended):** any small VPS (€4–6/mo) with Docker:

```yaml
# docker-compose.yml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=your-domain-or-ip
      - WEBHOOK_URL=https://your-domain-or-ip/
      - GENERIC_TIMEZONE=Europe/Rome
      - NODE_FUNCTION_ALLOW_BUILTIN=crypto   # required by WF3's JWT builder
      - KLING_ACCESS_KEY=your_kling_access_key   # WF3 only
      - KLING_SECRET_KEY=your_kling_secret_key   # WF3 only
    volumes:
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:
```

**Option B — n8n Cloud** (~€20/mo, zero maintenance): note that Cloud does not expose custom env vars for the Code node the same way — for WF3 on Cloud, paste the Kling keys directly into the "Build Kling JWT" code node instead of `$env`.

## 2. Credentials to create in n8n (Settings → Credentials)

| Credential | Type | Used by |
|---|---|---|
| Creatomate | **Header Auth** — name `Authorization`, value `Bearer YOUR_CREATOMATE_API_KEY` | WF1 (both Creatomate nodes) |
| YouTube | **YouTube OAuth2 API** (Google Cloud project with YouTube Data API v3 + YouTube Analytics API enabled) | WF1 upload, WF2 analytics |
| Google Sheets | **Google Sheets OAuth2 API** (same Google Cloud project, Sheets API enabled) | WF1, WF2, WF3 |
| Telegram | **Telegram API** — bot token from @BotFather; get your chat_id by messaging the bot and checking getUpdates | WF1, WF2, WF3 |
| Kling | env vars (see compose above) — API keys from Kling's developer console (separate from app credits; the API is billed on its own resource packages) | WF3 |

## 3. Import & configure

1. n8n → **Workflows → Import from File** → import each JSON.
2. Open each node with a ⚠️ and attach the right credential (n8n marks them after import).
3. Replace the placeholders:
   - `REPLACE_WITH_GOOGLE_SHEET_ID` — the ID from your tracker spreadsheet's URL (import `content/production-tracker.csv` into Google Sheets first; name the tab **Shots**, and add empty tabs **Publishing Log** and **Analytics Log**).
   - `REPLACE_WITH_TELEGRAM_CHAT_ID` — your chat ID.
   - In WF1's "Episode Config": the `source_url` points at `n8n/compositions/ep01-master.json` in this repo — commit the episode's Creatomate composition there when assembly starts (the skeleton is in the production plan §4).
4. **WF3 prerequisite:** add a `Prompt` column to the Shots tab and paste each shot's keyframe prompt from `content/chi-vive-nel-mare-production-plan.md` §2 (master style block + character refs appended).
5. Run WF1/WF3 manually the first times; activate WF2's schedule once the channel has uploads.

## 4. Connecting Claude to your n8n

Two complementary paths — both are set up in this repo:

### Path A — Claude Code sessions drive n8n (the `n8n-mcp` server in this repo)

The repo now contains `n8n-mcp/`, a small MCP server (same pattern as `creatomate-mcp`) that
wraps your n8n instance's REST API. It's already registered in `.mcp.json` — Claude Code
sessions in this repo pick it up automatically once two environment variables are set:

| Env var | Value |
|---|---|
| `N8N_BASE_URL` | Your instance URL, e.g. `https://n8n.yourdomain.com` |
| `N8N_API_KEY` | Create in n8n: **Settings → n8n API → Create API key** |

Tools Claude gets: `list_workflows`, `get_workflow`, `set_workflow_active`,
**`trigger_webhook`** (fires WF1/WF3 via their webhook paths), `list_executions`,
`get_execution` (with full node data for debugging failed runs).

WF1 and WF3 now ship with a **Webhook trigger** alongside the manual one, so once the
workflows are imported and **activated**, Claude can fire them at:

- `POST {N8N_BASE_URL}/webhook/limoncino-render-publish`
- `POST {N8N_BASE_URL}/webhook/limoncino-keyframe-batch`

Typical loop: Claude triggers the keyframe batch → checks `list_executions` → on `error`,
pulls `get_execution(include_data)` and diagnoses the failing node → re-triggers.

### Path B — Claude (Desktop app or claude.ai) drives n8n natively (MCP Server Trigger node)

This is what https://docs.n8n.io/connect/connect-to-n8n-mcp-server describes: n8n itself
becomes an MCP server, and Claude connects to it as a remote connector — no `n8n-mcp`
package needed for this path, and it works from the Claude Desktop app or claude.ai, not
just Claude Code sessions.

**1. Import `wf4-mcp-server-trigger.json`** (this repo) into n8n. It wires an **MCP Server
Trigger** node to three **Tool Workflow** nodes, one per pipeline workflow, each with a
plain-English name and description so Claude knows when to call it:
   - `render_and_publish_episode` → WF1
   - `generate_keyframe_batch` → WF3
   - `get_weekly_analytics` → WF2

**2. Point the Tool nodes at your actual workflows.** Open each `Tool: … (WFn)` node and,
in the Workflow field, pick the real WF1/WF2/WF3 from the dropdown (this replaces the
`REPLACE_WITH_WFn_WORKFLOW_ID` placeholder with the real ID — easier via the picker than
editing JSON).

**3. Set up auth on the trigger.** Open **MCP Server Trigger** → Credential → create a new
**Bearer Auth** credential → generate/paste a long random token (this is what Claude will
present on every call).

**4. Activate the workflow.** Open the MCP Server Trigger node — it now shows a
**Production URL** ending in `/mcp-server/http` (or `/mcp/limoncino-mcp` depending on
version — copy exactly what's shown). Copy that URL and the Bearer token from step 3.

**5. Connect Claude:**
   - **claude.ai / Claude Desktop:** Settings → Connectors → **Add custom connector** →
     paste the Production URL → when prompted for auth, paste the Bearer token → Save.
     Claude now lists `render_and_publish_episode`, `generate_keyframe_batch`, and
     `get_weekly_analytics` as callable tools directly in chat, no repo/session needed.
   - **Claude Code CLI**, one-liner (per n8n's docs):
     ```bash
     claude mcp add --transport http n8n-limoncino https://YOUR-N8N-URL/mcp-server/http \
       --header "Authorization: Bearer YOUR_BEARER_TOKEN"
     ```
   - **Older Claude Desktop versions** that only support local stdio servers use a bridge
     instead of a direct URL — add this to `claude_desktop_config.json` (Settings → Developer →
     Edit Config), substituting your URL and token:
     ```json
     {
       "mcpServers": {
         "n8n-limoncino": {
           "command": "npx",
           "args": ["-y", "mcp-remote", "https://YOUR-N8N-URL/mcp-server/http",
                    "--header", "Authorization:Bearer YOUR_BEARER_TOKEN"]
         }
       }
     }
     ```
     Restart Claude Desktop after saving.

Path A (`n8n-mcp` in this repo) and Path B are complementary, not exclusive: Path A gives
Claude Code sessions execution-log/debug tools (`get_execution`, `list_executions`) that
Path B's plain tool-calling doesn't expose; Path B is what lets the Claude Desktop app or
claude.ai — outside any repo session — trigger the pipeline directly. Use both.

Security notes: expose n8n over HTTPS only (Path 0's ngrok domain and Path 1's Hetzner+domain
setup both qualify); the Bearer token on the MCP Server Trigger and the n8n API key from
Path A are both secrets — treat them like passwords, and rotate the Bearer credential in n8n
if it's ever pasted somewhere public.

## 5. Notes & known edges

- **Made-for-kids:** WF1 sets `selfDeclaredMadeForKids: true` on upload. Verify the flag on the first upload in YouTube Studio, and set the AI-disclosure toggle there once (the API doesn't expose it).
- **Upload stays private** by design — QC first, then flip to public in Studio (or add a tiny "publish" workflow later).
- WF1's poll loop has no failure branch by design brevity — a `failed` render loops forever; if a render sits >15 min, check the Creatomate dashboard. (Easy upgrade: add a second IF on `status = failed` → Telegram alert.)
- WF3 generates **sequentially** (batchSize 1) to respect API rate limits; a 34-shot batch takes roughly 30–60 min unattended.
- Kling's API billing is separate from Kling app credits — buy an API resource package in their developer console, or swap the two Kling nodes for your generator of choice (Higgsfield/other): same pattern, different endpoint + auth header.
- The image-to-video clip batch (Day 3) is WF3 with the video endpoint (`/v1/videos/image2video`, body `{model_name, image: keyframe_url, prompt: motion_prompt, duration: 5}`) — clone the workflow, point it at a `Clip` column, add a `MotionPrompt` column.
