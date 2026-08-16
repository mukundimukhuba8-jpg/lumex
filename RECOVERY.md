# LUMEXAI / EdgeFlow recovery

Recovered from cloud-agent transcript:

`/tmp/cursor/cloud-agent-transcripts/2026-08-16T21-44-31Z-9a30/bc-019fbc8e-4faa-7104-92d1-e373752fb8c5/transcript.json`

into `/agent/lumex/` (original on-disk path was `/agent/edgeflow/`).

## Counts

| Metric | Value |
|--------|-------|
| Recovered files (total) | **65** |
| Source / config (ts/tsx/js/json/css-less) | **56** |
| Asset placeholders (1×1 PNG) | **7** |
| Misc (`.gitkeep`, `PLACEHOLDER.md`, this file) | **2** |

Method: stream-parse transcript `search_replace` diffs + full `read_file` snapshots + shell heredocs. Applied chronologically with special handling for the mid-run wipe (`create-expo-app` ~msg 1349) and `/tmp/edgeflow-recovery` restore (~msg 1425) by replaying the pre-wipe tree as the restore base, then applying later patches. **0 skipped hunks** in the final pass.

## Top-level layout

```
App.tsx
app.json
babel.config.js
index.ts
package.json
tsconfig.json
.gitignore
RECOVERY.md
assets/          # placeholders only
data/            # empty (.gitkeep)
server/          # Express API (auth, db, portal, eas)
src/             # Expo app (admin, auth, onboarding, screens, …)
```

## Critical gaps

1. **Real brand/bot artwork** — `assets/lumex-bot.png` and Expo icons are **1×1 placeholder PNGs**, not the original cyberpunk/bot art (binaries were not in the transcript; `/opt/cursor/artifacts/assets/lumex-bot.png` was also missing here).
2. **Earlier sibling transcripts** referenced for a richer recovery copy (`2026-08-10…`, `2026-08-14…`, subagent `bc-8bef5625-…`) were **not available** in this environment; pre-wipe state from *this* transcript was used as the restore stand-in.
3. **`node_modules` / lockfile** — not recovered; run `npm install` (native modules like `better-sqlite3` need a working toolchain).
4. **Runtime data** — SQLite DB / uploads under `data/` were not recovered (expected empty).
5. **`dist-web` build output** — intentionally omitted (rebuild with `npm run export:web`).
6. Some UI files (`AdminDrawer.tsx`, `SuperAdminPortal.tsx`, `PremiumScanner.tsx`) may be legacy relative to the final session-based admin shell; they were present in the transcript and kept.

## How to run (after install)

```bash
cd /agent/lumex
npm install
npm run server          # API on :8787
npx expo start          # or: npm run export:web
```

No GitHub tokens were written into this tree. Git is local-only (not pushed).
