# Deploy ONYX on Render

## Render service configuration

- Type: `Web Service`
- Runtime: `Node`
- Root Directory: leave empty
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- Health Check Path: `/api/health`

## What gets deployed

- backend API: `server/index.js`
- built frontend: `onyx-landing/dist`
- same origin API routes under `/api/*`

## Storage options

### Recommended: Supabase

Set these variables on Render:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:
- `SUPABASE_STORE_TABLE=onyx_store`

Before deploying, execute `supabase/schema.sql` in your Supabase SQL editor.

### Fallback: local JSON

If Supabase is not configured, ONYX writes to `data/onyx.json`.
For durable local storage on Render, attach a persistent disk and set:
- `DATA_DIR=/var/data`

## Claude setup for RadarV10

Set these variables on Render:
- `CLAUDE_KEY`
- `CLAUDE_MODEL=claude-sonnet-4-20250514` (optional)

## Other optional variables

- `SCAN_INTERVAL_MS=300000`