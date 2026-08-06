# Zapier Integration — Limoncino TV pipeline
### How the production pipeline connects to the user's Zapier stack

> Companion to `chi-vive-nel-mare-production-plan.md`. Status as of Aug 2026.

## Connected stack

| App | Status | Role in the pipeline |
|---|---|---|
| **YouTube** | ✅ Enabled (6 actions) — account authorized by user (Aug 2026); agent-side verification pending tool-call approval | Publish: `upload_video`, `upload_video_thumbnail`, `add_video_to_playlist`; measure: `get_report` (channel analytics), `find_video` (competitor/keyword checks) |
| **Google Sheets** | ✅ Connected | Production tracker: one row per shot (SH01–SH35) with status columns (keyframe ▸ clip ▸ approved), plus a publishing log sheet |
| **Telegram** | ✅ Connected | Pipeline notifications: render finished, upload done, daily shot-status summary |
| **Gmail** | ✅ Connected | Fallback notifications + weekly performance digest |

**YouTube authorization (required before any upload):**
`https://mcp.zapier.com/mcp/servers/d5c27f9c-2f86-4fad-a6d9-fe8eaed61de6/app-auth/YouTubeV4CLIAPI`
Sign in with the Google account that owns (or will own) the Limoncino TV channel.

## End-to-end automated flow

```
generate clips (Kling/Higgsfield)        → update Sheets tracker row per shot
assemble master (creatomate-mcp render)  → Telegram ping with output URL
upload_video (Zapier → YouTube)          → made_for_kids: true, lang: it
upload_video_thumbnail                   → 16:9 PNG < 2MB
add_video_to_playlist                    → "Estate con Limoncino! ☀️"
get_report (weekly)                      → views/watch-time → Sheets log + Gmail digest
```

## `upload_video` parameter mapping — Episode 1

| Param | Value |
|---|---|
| `title` | `Chi Vive nel Mare? 🐠 \| Limoncino TV – Canzoni per Bambini` |
| `description` | First line + per-animal timestamps from the script doc §7 |
| `video` | Creatomate render output URL (from `get_render`) |
| `thumbnail` | Rendered 16:9 thumbnail (≤2MB png/jpg) |
| `privacy_status` | `private` for QC review first → switch to `public` at publish time |
| `tags` | `canzoni per bambini, canzoni per bambini piccoli, animali del mare per bambini, filastrocche, video educativi per bambini, impara a contare` |
| `default_language` / `default_audio_language` | `it` / `it` |
| `made_for_kids` | **`true` (mandatory — COPPA/AGCOM)** |
| `notify_subscribers` | `true` |

Note: `publish_at` scheduling requires a YouTube Partner account — until then, upload private and flip to public manually or via a second call at publish time. The altered-content (AI) disclosure is not exposed by this Zapier action — set it once in YouTube Studio on first upload review.

## Remaining setup (blocked on user approval)

1. **Click the YouTube auth link above** — connects the channel account.
2. **Approve Zapier tool calls in Claude** when prompted — needed so the agent can (a) create the "Limoncino TV — Production Tracker" spreadsheet with the 34-shot list, and (b) verify the YouTube connection with a test `find_video` call.
3. Then production Day 1 (character sheets) can run with tracking + notifications live from the start.
