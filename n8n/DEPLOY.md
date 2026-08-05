# Getting an n8n instance — three realistic paths

You need one server running n8n. Ranked by fit for this project:

> ⚠️ Ruled out: Hugging Face Spaces free tier — HF now requires a PRO subscription ($9/mo) for
> Docker Spaces, and at that price a real VPS is cheaper and better (no sleeping, persistent disk).

## Path 1 — Railway one-click template (~$5/mo) · EASIEST, no terminal, works from a phone

1. Go to **railway.com** → sign up (GitHub or Google login).
2. Click **Deploy a Template** → search **"n8n"** → pick the official n8n template (the one **with Postgres** — that gives you persistence).
3. Click **Deploy**. ~2 minutes later you have a URL like `https://something.up.railway.app`.
4. In the n8n service → **Variables**, add:
   - `NODE_FUNCTION_ALLOW_BUILTIN=crypto` (needed by WF3's JWT builder)
   - `GENERIC_TIMEZONE=Europe/Rome`
   - `KLING_ACCESS_KEY` / `KLING_SECRET_KEY` (when you have them)
5. Open the URL → create your **owner account** → continue with "First boot" below.

Cost: Hobby plan $5/mo (includes $5 usage; a small n8n typically stays around that).

## Path 2 — Your own VPS (~€4–6/mo) · CHEAPEST at scale, full control, needs a terminal once

1. Get a small VPS: **Hetzner** (hetzner.com/cloud, CX22 ≈ €3.79/mo) or DigitalOcean/Contabo equivalent. Choose **Ubuntu 24.04**.
2. SSH in as root and run the bootstrap script from this repo:

   ```bash
   # quick start (HTTP on the server IP):
   curl -fsSL https://raw.githubusercontent.com/dadiboi89/my-agents-/refs/heads/claude/video-script-channel-analysis-kivp55/n8n/deploy/vps-bootstrap.sh | bash

   # or, with a domain pointed at the server (auto-HTTPS):
   curl -fsSL https://raw.githubusercontent.com/dadiboi89/my-agents-/refs/heads/claude/video-script-channel-analysis-kivp55/n8n/deploy/vps-bootstrap.sh -o setup.sh
   DOMAIN=n8n.yourdomain.com bash setup.sh
   ```
   (After the PR merges, swap `refs/heads/claude/...` for `main` in the URL.)

3. The script installs Docker, generates an encryption key, writes the compose file (with Caddy auto-HTTPS if `DOMAIN` is set), starts n8n, and prints your URL + next steps.

Note: YouTube OAuth requires HTTPS for the redirect — use the DOMAIN variant (a €2/yr domain is enough) or Path 1/3 if you don't want to manage a domain.

## Path 3 — n8n Cloud (€24/mo) · ZERO maintenance

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
