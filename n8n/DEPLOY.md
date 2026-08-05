# Getting an n8n instance — two realistic paths

You need one server running n8n. Ranked by fit for this project:

> ⚠️ Ruled out: Hugging Face Spaces free tier (Docker Spaces now require the $9/mo PRO plan)
> and Railway (user's choice).

## Path 1 — Your own VPS on Hetzner (~€4/mo) · RECOMMENDED — fully yours, no platform in the middle

### A. Zero-terminal setup (cloud-init — works from a phone)

1. Sign up at **hetzner.com/cloud** → create a project → **Add Server**.
2. Pick: location **Falkenstein** (or nearest) · image **Ubuntu 24.04** · type **Shared vCPU x86 → CX22** (≈ €3.79/mo).
3. Scroll to **Cloud config** and paste the contents of [`deploy/cloud-init.yaml`](deploy/cloud-init.yaml) from this repo.
4. Click **Create & Buy now**. Wait ~3 minutes (the server installs Docker + n8n by itself on first boot).
5. Open `http://SERVER-IP:5678` (the IP is shown on the server page) → create your **owner account** → continue with "First boot" below.

### B. Terminal setup (if you're comfortable with SSH)

SSH in as root and run:

```bash
# quick start (HTTP on the server IP):
curl -fsSL https://raw.githubusercontent.com/dadiboi89/my-agents-/refs/heads/claude/video-script-channel-analysis-kivp55/n8n/deploy/vps-bootstrap.sh | bash

# or, with a domain pointed at the server (auto-HTTPS):
curl -fsSL https://raw.githubusercontent.com/dadiboi89/my-agents-/refs/heads/claude/video-script-channel-analysis-kivp55/n8n/deploy/vps-bootstrap.sh -o setup.sh
DOMAIN=n8n.yourdomain.com bash setup.sh
```
(After the PR merges, swap `refs/heads/claude/...` for `main` in the URL.)

The script installs Docker, generates an encryption key, writes the compose file (with Caddy auto-HTTPS if `DOMAIN` is set), starts n8n, and prints your URL + next steps.

### HTTPS note (needed before connecting Google/YouTube)

Google OAuth refuses plain-HTTP redirect URLs, so the IP-only setup is fine for day one
(owner account, importing workflows, Telegram, Kling) but **before wiring the YouTube and
Google Sheets credentials you need HTTPS**: buy any cheap domain (€2–10/yr), point an A
record at the server IP, then re-run the script with `DOMAIN=...` (data is kept — the
script only rewrites the compose file). Total downtime: seconds.

## Path 2 — n8n Cloud (€24/mo) · ZERO maintenance

**n8n.io → Start free trial** → instance in 5 minutes, nothing to maintain. Trade-off: priciest, and WF3's Kling keys go directly into the "Build Kling JWT" code node instead of env vars (Cloud doesn't expose custom env). Pick this if you never want to think about hosting.

---

## First boot (all paths)

1. Open your n8n URL → **create the owner account** (do this immediately — until then the instance is open).
2. **Workflows → Import from File** → import `wf1-render-publish.json`, `wf2-weekly-analytics.json`, `wf3-keyframe-batch.json` from this repo.
3. Create the 4 credentials (see `README.md` §2) and attach them to the ⚠️ nodes.
4. Replace the `REPLACE_WITH_…` placeholders (sheet ID, Telegram chat ID).
5. **Activate** WF1 and WF3 (enables their webhook triggers).
6. **Settings → n8n API → Create API key.**
7. Give Claude the two values for this repo's environment:
   - `N8N_BASE_URL` = your instance URL
   - `N8N_API_KEY` = the key from step 6
   …and Claude can drive the whole pipeline through the `n8n-mcp` server (see `README.md` §4).
