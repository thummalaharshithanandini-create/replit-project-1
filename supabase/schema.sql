-- Optional cloud sync for language and pantry preferences.
-- The app accesses this table only from its Node server using the service-role key.
create table if not exists public.pantry_preferences (
  device_id uuid primary key,
  language text not null check (language in ('en', 'te', 'hi', 'ta', 'kn', 'ml')),
  ingredients jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.pantry_preferences enable row level security;
revoke all on public.pantry_preferences from anon, authenticated;
grant all on public.pantry_preferences to service_role;
