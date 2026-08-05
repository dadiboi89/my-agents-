# n8n Workflows — Limoncino TV pipeline

Self-hosted automation replacing the Zapier last-mile (and going further: generation batching).
No per-call approval gates — the workflows run on your server, under your credentials.

## The three workflows

| File | Trigger | What it does |
|---|---|---|
| `wf1-render-publish.json` | Manual (click "Execute") | Fetches the episode's Creatomate composition JSON (from this repo's raw URL) → starts the render → polls every 30s until done → downloads the MP4 → uploads to YouTube **private** with made-for-kids + Italian metadata → logs to the "Publishing Log" sheet → Telegram ping with the video link |
| `wf2-weekly-analytics.json` | Every Monday 08:00 | Pulls last-7-days channel stats from the YouTube Analytics API → appends to the "Analytics Log" sheet → sends a Telegram digest |
| `wf3-keyframe-batch.json` | Manual | Reads the "Shots" sheet (the tracker CSV imported to Google Sheets), takes every row with `Keyframe = todo` and a `Prompt`, generates each keyframe via the Kling API (one at a time, polling until done), writes the image URL back into the row, Telegram ping when the batch finishes |

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

## 4. Notes & known edges

- **Made-for-kids:** WF1 sets `selfDeclaredMadeForKids: true` on upload. Verify the flag on the first upload in YouTube Studio, and set the AI-disclosure toggle there once (the API doesn't expose it).
- **Upload stays private** by design — QC first, then flip to public in Studio (or add a tiny "publish" workflow later).
- WF1's poll loop has no failure branch by design brevity — a `failed` render loops forever; if a render sits >15 min, check the Creatomate dashboard. (Easy upgrade: add a second IF on `status = failed` → Telegram alert.)
- WF3 generates **sequentially** (batchSize 1) to respect API rate limits; a 34-shot batch takes roughly 30–60 min unattended.
- Kling's API billing is separate from Kling app credits — buy an API resource package in their developer console, or swap the two Kling nodes for your generator of choice (Higgsfield/other): same pattern, different endpoint + auth header.
- The image-to-video clip batch (Day 3) is WF3 with the video endpoint (`/v1/videos/image2video`, body `{model_name, image: keyframe_url, prompt: motion_prompt, duration: 5}`) — clone the workflow, point it at a `Clip` column, add a `MotionPrompt` column.
