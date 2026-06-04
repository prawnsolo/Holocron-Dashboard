<!--
METADATA
last_indexed: 2026-06-04
repo: prawnsolo/Holocron-Dashboard
branch: master
refresh_reminder: Re-index by 2026-06-11 (7-day cadence)
codegraph_nodes: 77
codegraph_edges: 106
codegraph_files: 11
-->

# CODEBASE_MAP — Holocron Dashboard (OB1)

> Agent navigation file. Load this before working with `prawnsolo/Holocron-Dashboard`.

---

## Project Purpose

The Holocron Dashboard is a **Jedi-Archive-inspired personal OS** for memory and project management, built by/for "OB1". It is a Progressive Web App (PWA) that provides:

- A unified dashboard for tasks, projects, people follow-ups, and memory capture
- A real-time sync layer to a Supabase backend that stores all captured "thoughts"
- A Slack integration for capturing thoughts via a bot in a designated channel
- An MCP (Model Context Protocol) server so AI assistants (Claude, ChatGPT, etc.) can read and write directly to the OB1 brain
- Offline support via a Service Worker

The aesthetic is deliberately sci-fi / Jedi Archive: dark background, cyan "Force Teal" primary accent, Orbitron display font, diamond-shaped logo.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML + CSS + JavaScript (no framework, no build step) |
| PWA | Web App Manifest + Service Worker (`sw.js`) |
| Charts | Chart.js (CDN) |
| Icons | Lucide Icons (CDN, unpkg) |
| Fonts | Google Fonts: Orbitron, Exo 2, JetBrains Mono |
| Backend | Supabase (Postgres + pgvector + Edge Functions) |
| Edge Functions runtime | Deno (TypeScript) |
| Edge Function framework | Hono v4.9.2 |
| MCP SDK | @modelcontextprotocol/sdk v1.24.3 |
| LLM / Embeddings gateway | OpenRouter (models: openai/text-embedding-3-small, openai/gpt-4o-mini) |
| Slack integration | Slack Events API (bot token, webhook listener) |

---

## Directory Structure

```
Holocron-Dashboard/
├── index.html                          # Single-page app shell; login overlay + tab panels
├── manifest.json                       # PWA manifest (name, icons, theme_color #00d4ff)
├── sw.js                               # Service Worker — cache-first for all static assets
│
├── css/
│   ├── tokens.css                      # Design tokens: colors, typography, spacing, radii
│   ├── base.css                        # CSS reset + layout (sidebar, main-content, responsive)
│   └── components.css                  # Component styles: panels, KPI cards, badges, etc.
│
├── js/
│   ├── config.js                       # window.CONFIG — API_BASE URL
│   ├── state.js                        # Global STATE object + auth/sync logic (syncOB1)
│   ├── router.js                       # Tab navigation, hash routing, dark/light mode toggle
│   ├── dashboard.js                    # renderDashboard() + KPI cards, task/person rows
│   ├── projects.js                     # renderProjects() — list / kanban / timeline views
│   ├── memory.js                       # renderMemory() — memory feed, category map, extensions
│   └── weekly.js                       # renderWeekly() — recap, wins, open loops, Chart.js
│
├── assets/
│   ├── icon-192.png                    # PWA icon (192x192)
│   ├── icon-512.png                    # PWA icon (512x512)
│   └── logo.svg                        # Inline SVG diamond-shaped holocron logo
│
└── supabase/
    ├── config.toml                     # Supabase CLI config (function definitions)
    ├── .temp/                          # Supabase CLI temp files (project-ref, versions)
    └── functions/
        ├── holocron-api/               # Dashboard data API
        │   ├── index.ts                # GET: auth + fetch thoughts, map to STATE shape
        │   └── deno.json               # Imports: hono, @supabase/supabase-js
        │
        ├── ingest-thought/             # Slack webhook receiver
        │   ├── index.ts                # Events API handler: embed + extract metadata + insert
        │   └── deno.json               # Imports: @supabase/supabase-js
        │
        └── open-brain-mcp/             # MCP server + unified API
            ├── index.ts                # MCP tools + GET holocron mode + POST MCP transport
            └── deno.json               # Imports: hono, @hono/mcp, @modelcontextprotocol/sdk, zod
```

---

## Key Files and Components

### Frontend Entry Point
**`index.html`** — Single HTML file. Defines the sidebar nav (Overall, Projects, Memory, Weekly Recap), four empty `div#tab-*` panels, and a login overlay with password input. Scripts are loaded in this order: `config.js → state.js → dashboard.js → projects.js → memory.js → weekly.js → router.js`.

### State and Auth (`js/state.js`)
- `window.STATE` — global object holding seed/mock data: tasks, projects, people, memories, memoryStats, weekly
- `syncOB1()` — fetches `CONFIG.API_BASE` with `x-brain-key` header; on success populates STATE and fires `ob1-synced` CustomEvent; on 401 forces re-login
- `BRAIN_KEY` — persisted in `localStorage` under key `holocron_key`
- `showLogin()` / `hideLogin()` / `handleLogin()` — login overlay management
- Helper functions: `isOverdue()`, `isDueToday()`, `getTopActions()`

### Router (`js/router.js`)
- `navigate(tab)` — activates the correct panel + nav item + calls the matching render function
- Hash-based routing: `location.hash` drives which tab opens on load
- Mobile sidebar toggle on tap; collapses on scroll
- Dark/light mode toggle via `[data-theme]` attribute on `<html>`; state stored in-memory only (not persisted)

### Tab Renderers

| File | Function | Description |
|---|---|---|
| `dashboard.js` | `renderDashboard()` | KPI grid (open tasks, active projects, memories, overdue), top 3 actions, overdue tasks, people to connect, stuck/neglected projects |
| `projects.js` | `renderProjects()` | Three views: list (table), kanban (Active/Stalled/Done columns), timeline (progress bars by recency) |
| `memory.js` | `renderMemory()` | Stats KPIs, category breakdown bars, extensions status, recent memories feed, mock agent activity log |
| `weekly.js` | `renderWeekly()` | Wins + reflection textarea, open loops, blocked items, next week priorities, Chart.js memory growth line chart, people follow-up summary |

### Design System (`css/tokens.css`)
All colors and spacing use CSS custom properties. Key tokens:
- `--color-primary: #00d4ff` (Force Teal — used throughout for accents, borders, highlights)
- `--color-bg: #0d0e11` (near-black background)
- `--font-display: Orbitron` (headers, nav, labels)
- `--font-body: Exo 2`
- `--font-mono: JetBrains Mono` (timestamps, code)
- Light theme variant provided via `[data-theme="light"]` selector

---

## Tabs / Pages (Routing)

| Hash | Tab ID | Render Function | Purpose |
|---|---|---|---|
| `#dashboard` (default) | `tab-dashboard` | `renderDashboard()` | Overall OS view — tasks, alerts, people, stuck projects |
| `#projects` | `tab-projects` | `renderProjects()` | Project management in list, kanban, or timeline views |
| `#memory` | `tab-memory` | `renderMemory()` | Memory bank — categories, extensions, recent captures |
| `#weekly` | `tab-weekly` | `renderWeekly()` | Weekly review — wins, open loops, blocked, next priorities, chart |

---

## Backend — Supabase Edge Functions

### `holocron-api` (deployed URL: `https://sacrmmpxjfxqwscxggbx.supabase.co/functions/v1/holocron-api`)
- Auth: `x-brain-key` header or `?key=` query param checked against `MCP_ACCESS_KEY`
- GET `*`: Returns JSON shaped as `{ tasks, projects, people, memories, stats }` drawn from the `thoughts` table
- Serves as the primary sync endpoint called by `syncOB1()` in the frontend

### `ingest-thought`
- Listens to Slack Events API webhook
- Handles `url_verification` challenge
- On `message` event in `SLACK_CAPTURE_CHANNEL`: generates embedding via OpenRouter, extracts metadata via GPT-4o-mini, inserts into `thoughts` table with dedup check on `metadata->slack_ts`, posts confirmation reply in thread

### `open-brain-mcp`
A unified function serving two roles:
1. **GET `?mode=holocron`** — same dashboard data shape as `holocron-api` (duplicate logic; potential consolidation candidate)
2. **POST** — MCP StreamableHTTP transport, exposing four MCP tools:
   - `search_thoughts` — semantic search via `match_thoughts` RPC (pgvector cosine similarity)
   - `list_thoughts` — list recent thoughts with filters: type, topic, person, days
   - `thought_stats` — aggregate counts by type, topic, people
   - `capture_thought` — insert a new thought with auto-embedding and metadata extraction

---

## Integrations

| Integration | Where | Notes |
|---|---|---|
| Supabase Postgres | All Edge Functions | Table: `thoughts` (content, embedding vector, metadata JSONB, created_at) |
| Supabase pgvector | `open-brain-mcp` | RPC: `match_thoughts(query_embedding, match_threshold, match_count, filter)` |
| OpenRouter | `ingest-thought`, `open-brain-mcp` | Embeddings: `openai/text-embedding-3-small`; Metadata: `openai/gpt-4o-mini` |
| Slack Events API | `ingest-thought` | Slack bot listens on one capture channel, replies in thread |
| Chart.js | `weekly.js` | Memory growth 7-day line chart (CDN) |
| Lucide Icons | All tab renderers | Dynamic icon injection via `lucide.createIcons()` |
| Google Fonts | `index.html` | Orbitron, Exo 2, JetBrains Mono |
| MCP Protocol | `open-brain-mcp` | Exposes OB1 brain to Claude, ChatGPT, and any MCP-compatible AI client |

---

## Environment Variables

All env vars are consumed by Supabase Edge Functions (set in Supabase dashboard secrets):

| Variable | Function(s) | Purpose |
|---|---|---|
| `SUPABASE_URL` | all | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | all | Service role key for Supabase client |
| `MCP_ACCESS_KEY` | `holocron-api`, `open-brain-mcp` | Shared secret used as `x-brain-key`; also stored in browser `localStorage` as `holocron_key` |
| `OPENROUTER_API_KEY` | `ingest-thought`, `open-brain-mcp` | API key for OpenRouter (embeddings + GPT-4o-mini) |
| `SLACK_BOT_TOKEN` | `ingest-thought` | Slack bot OAuth token for posting replies |
| `SLACK_CAPTURE_CHANNEL` | `ingest-thought` | Slack channel ID to watch for incoming thoughts |

Frontend env vars: None — `js/config.js` hardcodes `API_BASE` as a public Supabase function URL.

---

## Stale / Incomplete Areas

- **`openAddTask()`**, **`openAddPerson()`**, **`openAddProject()`**, **`openAddMemory()`**, **`editProject()`** — all show `alert('... functionality coming soon!')`. CRUD modals are not yet built.
- **`agentLog()`** in `memory.js` — hardcoded mock data; not wired to real Supabase logs.
- **`STATE.weekly.wins`** — text area input not persisted to backend.
- **`js/config.js`** hardcodes the Supabase project URL; no `.env` pattern for the frontend.
- **`open-brain-mcp` GET `?mode=holocron`** duplicates the full `holocron-api` function logic — consolidation opportunity.
- **Light mode** — toggle works in-memory but preference is not persisted (no `localStorage` save for theme).
- **`supabase/config.toml`** — only defines `ingest-thought` and `open-brain-mcp`; `holocron-api` function is deployed but absent from config.
- **`state.js`** has a bug in `getTopActions()`: the inner `score` arrow function references `t` as a parameter shadowing the outer `filter` callback variable — potential runtime error when priority logic runs.

---

## Codegraph Coverage

```
Files indexed:  11 (all JS + TS source files)
Nodes:          77
  - function:   29
  - constant:   25
  - file:       11
  - import:     10
  - variable:    2
Edges:          106
Languages:      javascript (8 files), typescript (3 files)
DB size:        0.28 MB
Index status:   Up to date as of 2026-06-04
```

Files NOT indexed by codegraph (intentional — non-code assets): `index.html`, `manifest.json`, `sw.js`, `css/*.css`, `assets/*`, `supabase/config.toml`, `supabase/.temp/*`.

---

*Last updated: 2026-06-04 | Next refresh due: 2026-06-11*
