# ONYX

ONYX is deployable on Render as a single Node web service with:
- a React/Vite frontend in `onyx-landing`
- an Express backend in `server/index.js`
- automated RSS / HTML collection
- a REST API for the Radar UI
- storage that can run on local JSON or on Supabase

## Current modules in the repo

- `Landing.jsx`: product landing page
- `Radar.jsx`: live ONYX Radar dashboard powered by `/api`
- `RadarV10.jsx`: advanced prototype kept in the frontend for future integration
- `server/index.js`: scraping, API, scheduling, persistence layer

## Data storage modes

The backend now supports two storage modes:
- local JSON fallback in `data/onyx.json`
- Supabase via `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`

If Supabase variables are present, the server stores the ONYX state in the `onyx_store` table.
If they are absent, the app keeps using the local JSON file.

## Render deployment

In Render -> New -> Web Service:
- Runtime: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- Root Directory: leave empty

## Environment variables

Required for Supabase mode:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:
- `SUPABASE_STORE_TABLE` (default: `onyx_store`)
- `SCAN_INTERVAL_MS` (default: `300000`)
- `DATA_DIR` (used only for local JSON fallback)

## Supabase setup

1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql`.
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on Render.
4. Redeploy the service.

## Notes

- The current frontend still talks only to `/api`, so no frontend secret is required for storage.
- `RadarV10.jsx` still contains a direct Anthropic call in the client prototype. That should be moved server-side before production use.