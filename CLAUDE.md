# CLAUDE.md — Walk Through Jerusalem

This file gives you persistent context for the WalkthroughJerusalem project.
Read it at the start of every session before writing or modifying any code.

---

## Project Overview

**Walk Through Jerusalem** is an interactive historical map of Jerusalem's Old City
at walkthroughjerusalem.org. Every building, street, and monument carries its full
historical record spanning from the Canaanite period to the present day.

Key features:
- Property-by-property granularity — every structure gets its own record
- Era toggle layers (9 historical periods, each with its own colour palette)
- Community contributions with editorial verification
- AI-assisted content generation via Claude API
- Free to use, ad-free — public good / cultural resource

---

## Repository

- **GitHub**: andrebaruch/WalkthroughJerusalem
- **Hosting**: Netlify (auto-deploy on push to main)
- **Live URL**: walkthroughjerusalem.org
- **Netlify project**: walkthroughjerusalem.netlify.app
- **DNS**: Cloudflare (DNS-only, A record + CNAME pointing to Netlify)
- **SSL**: Let's Encrypt via Netlify

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Mapbox GL JS v3.3.0 | Map engine — tiles, zoom, building footprints, click events |
| OpenStreetMap | Underlying map data — building footprints, streets, labels |
| GeoJSON | File format for historical site data |
| Supabase | PostgreSQL database for property records and submissions |
| Netlify Functions | Server-side scripts for DB queries and AI calls |
| Claude API | Generates and enriches historical content on demand |

---

## Folder Structure

```
/
├── index.html              # Main page — loads the map
├── style.css               # Visual styling for map and panels
├── map.js                  # Map init, layer toggling, click handlers
├── netlify.toml            # Build config — injects MAPBOX_TOKEN at build time
├── data/
│   ├── sites.geojson       # Curated site data (coordinates + historical content)
│   └── eras.json           # Era definitions and colour palette
├── functions/
│   ├── ask-claude.js       # Netlify Function — calls Claude API
│   └── submit.js           # Netlify Function — handles community submissions
└── admin/
    └── index.html          # Password-protected editor review interface
```

---

## Environment Variables

**Never commit tokens or keys to version control.**

| Variable | Where used | Purpose |
|----------|-----------|---------|
| `MAPBOX_TOKEN` | Netlify env + netlify.toml | Injected into map.js at build time via sed |
| `ANTHROPIC_API_KEY` | Netlify env | Used by functions/ask-claude.js |
| `SUPABASE_URL` | Netlify env | Supabase project URL |
| `SUPABASE_ANON_KEY` | Netlify env | Supabase public anon key |

### Mapbox token injection pattern
The `netlify.toml` build command uses `sed` to replace a placeholder string in `map.js`
with the real token at build time. The placeholder in `map.js` must exactly match
the string targeted by the sed command. Do not alter either without updating both.

---

## Map Configuration

- **Centre**: 31.7767° N, 35.2345° E (Jerusalem Old City)
- **Default zoom**: 16
- **Building footprints**: OSM vector tiles, semi-transparent fill
- **Click handler**: looks up OSM ID in sites.geojson → populates side panel
- **No record**: shows contribution prompt
- **Era filter**: Mapbox filter expression on buildings layer — updates in real time, no reload

---

## GeoJSON Schema (sites.geojson)

Each feature in sites.geojson follows this structure:

```json
{
  "type": "Feature",
  "geometry": { "type": "Point", "coordinates": [lng, lat] },
  "properties": {
    "id": "osm-123456789",
    "name": "Byzantine Cardo — Column Section",
    "type": "street",
    "eras": ["roman", "byzantine", "crusader"],
    "built": "6th century CE (Emperor Justinian)",
    "history": "Rich text historical narrative...",
    "events": [{ "year": 1967, "text": "Excavations begin..." }],
    "sources": ["Avigad, Nahman — Discovering Jerusalem (1983)"],
    "photos": ["https://commons.wikimedia.org/..."],
    "contributed_by": "Editor name or 'community'",
    "verified": true
  }
}
```

Valid `type` values: `street`, `building`, `gate`, `church`, `synagogue`, `mosque`, `archaeological`

---

## Era Definitions

| Era key | Label | Date range | Colour |
|---------|-------|-----------|--------|
| `canaanite` | Canaanite / Israelite | Before 63 BCE | #C4952A |
| `roman` | Roman (Aelia Capitolina) | 63 BCE – 324 CE | #C0522A |
| `byzantine` | Byzantine | 324 – 638 CE | #6B4FA0 |
| `islamic` | Early Islamic / Umayyad | 638 – 1099 CE | #2A7A6B |
| `crusader` | Crusader | 1099 – 1187 CE | #3A5A8B |
| `mamluk` | Ayyubid / Mamluk | 1187 – 1517 CE | #3A6B3A |
| `ottoman` | Ottoman | 1517 – 1917 CE | #8B2A3A |
| `mandate` | British Mandate | 1917 – 1948 | #8B7A3A |
| `modern` | Modern (Israel) | 1948 – present | #6B6B6B |

---

## Netlify Functions

### functions/ask-claude.js
- **Receives**: building name, OSM ID, coordinates, current era selection
- **Calls**: Claude API (`claude-haiku-4-5` — fast, low cost ~$0.001/call)
- **Returns**: structured JSON `{ summary, key_dates, significance, suggested_sources }`
- **AI prompt**: system role as Jerusalem historian; output schema enforced; includes "do not fabricate" instruction

### functions/submit.js
- **Receives**: submitted text, name/email (optional), building ID, sources
- **Validates**: minimum content length, spam patterns, required fields
- **Stores**: Supabase `submissions` table with `status: 'pending'`
- **Returns**: confirmation message to user

---

## Claude API Prompt Template (for ask-claude.js)

```
System: You are a historian specialising in Jerusalem and the Levant.
        Respond only in structured JSON. Do not fabricate dates or events.
        If information is uncertain or unknown, say so explicitly.

User:   Building: {name}
        Location: {lat}, {lng}
        Era focus: {selected_era}

        Return JSON matching this schema:
        {
          "summary": "2-3 sentence overview",
          "built": "date or era",
          "significance": "1 sentence",
          "events": [{ "year": number, "text": "string" }],
          "suggested_sources": ["string"]
        }
```

---

## Development Environment

- **OS**: Windows
- **Terminal**: Git Bash (MinTTY) — use this, not PowerShell
- **Editor**: VS Code
- **Node**: installed (required for Netlify CLI and Claude Code)
- **Deploy workflow**: edit locally → git push → Netlify auto-deploys within 60s

### Git caution
`rm -rf .git` destroys repository history. Never run this unless explicitly recovering
from a corrupt repo state. Always commit and push before destructive operations.

---

## Current Status (as of Phase 2)

- [x] Domain registered (walkthroughjerusalem.org via Cloudflare)
- [x] GitHub repo connected to Netlify with auto-deploy
- [x] Mapbox GL JS map working, centred on Old City
- [x] Clickable buildings displaying OSM IDs in sidebar
- [x] Mapbox token injecting securely via netlify.toml + Netlify env vars
- [ ] **Next: Phase 2 Step 7** — GeoJSON data structure + first real historical records
- [ ] Era toggle layers
- [ ] Supabase database connection
- [ ] Submission form + admin panel
- [ ] Claude API integration (ask-claude.js)

---

## Soft Launch Plan

Launch focus: **the Cardo** (main colonnaded street of the Byzantine Old City).
Target: 20–30 curated property records before going live.
Then: share with trusted historians before opening to public contributions.

---

*This file should be updated whenever significant architectural decisions are made.*
*Last updated: June 2026*
