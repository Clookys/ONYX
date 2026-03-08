create table if not exists public.onyx_store (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.onyx_store is
  'Stores the ONYX application state as a single JSON document for the backend API.';