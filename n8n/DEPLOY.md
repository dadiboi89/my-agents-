# Getting an n8n instance

You need one machine running n8n. Ranked by cost:

> ⚠️ Ruled out: Hugging Face Spaces free tier (Docker Spaces now require the $9/mo PRO plan),
> Railway (user's choice), and hosting "free tiers" that require a payment card or that
> sleep/wipe data (Render/Koyeb/Fly free tiers lack persistent disks or spin down — n8n
> loses workflows and credentials).

## Path 0 — €0: run n8n on YOUR OWN COMPUTER · the truly free option

No card, no hosting account. n8n is a small program; any laptop/PC from the last decade runs it.
Trade-off: the computer must be **on** while workflows run — fine for a weekly production
cadence. (WF2's Monday schedule fires only if it's on; otherwise run it manually.)

### One-time setup (~15 min)

1. **Free HTTPS address** (needed so Google login, webhooks, and Claude can reach it):
   sign up free at **ngrok.com** (no card) → dashboard → claim your **1 free static domain**
   (e.g. `yourname.ngrok-free.app`) → follow their 2-line install instructions for your OS.
2. **Install Docker Desktop** (free, docker.com) — or skip Docker and use Node.js 18+: `npx n8n`.
3. Download [`deploy/local-docker-compose.yml`](deploy/local-docker-compose.yml) from this repo,
   replace `YOUR-SUBDOMAIN.ngrok-free.app` in it (2 places), then run:
   ```bash
   docker compose -f local-docker-compose.yml up -d
   ngrok http --domain=YOUR-SUBDOMAIN.ngrok-free.app 5678
   ```
4. Open `https://YOUR-SUBDOMAIN.ngrok-free.app` → create the **owner account** → "First boot" below.

Because the ngrok domain is static and HTTPS: Google/YouTube OAuth works, webhook URLs stay
stable, and `N8N_BASE_URL` for Claude's `n8n-mcp` is simply your ngrok URL. Data persists in a
Docker volume across restarts. The tunnel only carries inbound requests (logins, webhook
triggers) — video downloads/uploads go direct from your machine, so ngrok's free limits don't
bite.

### Free always-on upgrade later (optional)

**Oracle Cloud "Always Free"** offers a permanently free VPS (up to 4 ARM cores / 24 GB RAM —
overkill for n8n). Signup requires a card for identity verification, but Always Free resources
are never charged. If you go this route later: create an Ubuntu 24.04 VM and paste
[`deploy/cloud-init.yaml`](deploy/cloud-init.yaml) into the cloud-init box — same zero-terminal
setup as Path 1. (Popular regions sometimes show "out of capacity" — retry or switch region.)

## Path 1 — Your own VPS on Hetzner (~€4/mo) — 24/7 without your computer

### A. Zero-terminal setup (cloud-init — works from a phone)

1. Sign up at **hetzner.com/cloud** → create a project → **Add Server**.
2. Pick: location **Falkenstein** (or nearest) · image **Ubuntu 24.04** · type **CX22** (≈ €3.79/mo).
3. Scroll to **Cloud config** and paste the contents of [`deploy/cloud-init.yaml`](deploy/cloud-init.yaml).
4. Click **Create & Buy now**. Wait ~3 minutes (the server installs Docker + n8n by itself).
5. Open `http://SERVER-IP:5678` → create your **owner account** → "First boot" below.

### B. Terminal setup (SSH)

```bash
# quick start (HTTP on the server IP):
curl -fsSL https://raw.githubusercontent.com/dadiboi89/my-agents-/refs/heads/claude/video-script-channel-analysis-kivp55/n8n/deploy/vps-bootstrap.sh | bash

# or, with a domain pointed at the server (auto-HTTPS):
curl -fsSL https://raw.githubusercontent.com/dadiboi89/my-agents-/refs/heads/claude/video-script-channel-analysis-kivp55/n8n/deploy/vps-bootstrap.sh -o setup.sh
DOMAIN=n8n.yourdomain.com bash setup.sh
```
(After the PR merges, swap `refs/heads/claude/...` for `main` in the URL.)

**HTTPS note:** Google OAuth refuses plain-HTTP redirects, so the IP-only setup is fine for
day one, but before wiring YouTube/Sheets credentials you need HTTPS: point any cheap domain
(€2–10/yr) at the server and re-run the script with `DOMAIN=...` (data is kept). On Path 0
this is a non-issue — ngrok is already HTTPS.

## Path 2 — n8n Cloud (€24/mo) · ZERO maintenance

**n8n.io → Start free trial** → instance in 5 minutes, nothing to maintain. Trade-off:
priciest, and WF3's Kling keys go directly into the "Build Kling JWT" code node instead of env
vars (Cloud doesn't expose custom env). Pick this if you never want to think about hosting.

---

## First boot (all paths)

1. Open your n8n URL → **create the owner account** (do this immediately — until then the
   instance is open).
2. **Workflows → Import from File** → import `wf1-render-publish.json`,
   `wf2-weekly-analytics.json`, `wf3-keyframe-batch.json` from this repo.
3. Create the 4 credentials (see `README.md` §2) and attach them to the ⚠️ nodes.
4. Replace the `REPLACE_WITH_…` placeholders (sheet ID, Telegram chat ID).
5. **Activate** WF1 and WF3 (enables their webhook triggers).
6. **Settings → n8n API → Create API key.**
7. Give Claude the two values for this repo's environment:
   - `N8N_BASE_URL` = your instance URL (Path 0: your ngrok URL)
   - `N8N_API_KEY` = the key from step 6
   …and Claude can drive the whole pipeline through the `n8n-mcp` server (see `README.md` §4).
