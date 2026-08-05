# Creatomate MCP Server

An MCP server that exposes the [Creatomate](https://creatomate.com) video/image
rendering API as tools Claude Code can call directly.

## Tools

- `list_templates` — list templates in your Creatomate project
- `get_template` — fetch a single template's details
- `render` — start a render from a `template_id` (with `modifications`) or raw `source` JSON
- `get_render` — check a render's status and get its output URL
- `list_renders` — list recent renders, optionally filtered by status

## Setup

1. Install dependencies (already run during setup, re-run if needed):
   ```
   npm install
   ```
2. Get your API key from the Creatomate dashboard: log in at
   creatomate.com, open your Project, then go to **API** in the sidebar.
3. Set it as an environment variable — do not hardcode it anywhere:
   ```
   export CREATOMATE_API_KEY="your-key-here"
   ```

This server is already registered in the repo's `.mcp.json` at the project
root, pointing at `./creatomate-mcp/index.js` and reading
`CREATOMATE_API_KEY` from the environment. Once the env var is set, Claude
Code will pick up the `creatomate` MCP server automatically on the next
session start (or after running `/mcp` to reload).

## Manual test

```
CREATOMATE_API_KEY=your-key-here node index.js
```

The process just waits on stdio for MCP requests — that's expected, it's
not meant to print anything on its own.
